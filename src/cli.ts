#!/usr/bin/env node

import { cac } from 'cac'
import { walk, exists, fileSize } from './utils/fs.js'
import { packCAR } from './utils/ipfs.js'
import path from 'node:path'
import {
  findEnvVarProviderName,
  parseTokensFromEnv,
  tokensToProviderNames,
} from './utils/env.js'
import * as log from './log.js'
import { PROVIDERS } from './constants.js'
import mod from 'ascii-bar'
import {
  InvalidCIDError,
  MissingDirectoryError,
  MissingKeyError,
  NoProvidersError,
  UnknownProviderError,
} from './errors.js'
import { CID } from 'multiformats/cid'
import { encodeIpfsHashAndUpdateEns, initializeEthereum } from './utils/ens.js'
import { TransactionExecutionError, formatEther } from 'viem'
import type { Hash } from 'viem'

const AsciiBar = mod.default

const cli = cac('blumen')

cli
  .command('deploy [dir]', 'Deploy a web app on IPFS')
  .option('--strict', 'Throw if one of the providers fails', {
    default: true,
  })
  .action(async (dir, { strict }: { strict: boolean }) => {
    if (!dir) {
      if (await exists('dist')) dir = 'dist'
      else dir = '.'
    }
    const normalizedPath = path.join(process.cwd(), dir)
    const name = path.basename(normalizedPath)
    const [size, files] = await walk(normalizedPath)

    if (size === 0) throw new MissingDirectoryError(dir)

    log.packing(dir === '.' ? name : dir, fileSize(size, 2))

    const { rootCID, blob } = await packCAR(files, name)

    log.root(rootCID)

    const apiTokens = parseTokensFromEnv()

    const providers = tokensToProviderNames(apiTokens.keys())

    if (!providers.length) throw new NoProvidersError()

    log.providersList(providers)

    let total = 0

    const bar = process.stdout.isTTY
      ? new AsciiBar({
          total: providers.length,
          formatString: '#spinner #bar #message',
          hideCursor: false,
          enableSpinner: true,
          width: process.stdout.columns - 30,
        })
      : undefined

    const errors: Error[] = []

    for (const provider of providers) {
      const envVar = findEnvVarProviderName(provider)!
      const token = apiTokens.get(envVar)!

      if (providers.indexOf(provider) === 0) {
        bar?.update(total++, `Uploading to ${provider}`)

        try {
          await PROVIDERS[envVar]!.upload({
            name,
            car: blob,
            token,
            accessKey: apiTokens.get('GW3_ACCESS_KEY'),
          })
        } catch (e) {
          if (strict) throw e
          else errors.push(e as Error)
        }
      } else {
        bar?.update(total++, `Pinning to ${provider}`)

        try {
          await PROVIDERS[envVar]!.upload({
            name,
            cid: rootCID.toString(),
            token,
            accessKey: apiTokens.get('GW3_ACCESS_KEY'),
          })
        } catch (e) {
          if (strict) throw e
          else errors.push(e as Error)
        }
      }
    }
    bar?.update(total) // finish

    if (errors.length === providers.length) return log.deployFailed(errors)
    else if (errors.length) log.uploadPartiallyFailed(errors)
    else log.uploadFinished()

    /* WIP ENS + GNOSIS INTEGRATION */

    log.deployFinished(rootCID.toString())
  })

cli
  .command('status <cid>', 'Check IPFS pinning status')
  .option('--providers [providers]', 'List providers to check status from')
  .action(
    async (
      cid: string,
      { providers: providersOptionList }: { providers: string },
    ) => {
      // Validate CID
      try {
        CID.parse(cid)
      } catch {
        throw new InvalidCIDError(cid)
      }

      const env = parseTokensFromEnv()
      const tokens: string[] = []

      for (const option of env.keys()) tokens.push(option)

      if (providersOptionList) {
        for (const option of providersOptionList
          .split(',')
          .map((s) => s.trim())) {
          const tokenName = findEnvVarProviderName(option)
          if (tokenName) tokens.push(tokenName)
          else throw new UnknownProviderError(option)
        }
      }

      if (tokens.length === 0) throw new NoProvidersError()

      for (const token of tokens) {
        const provider = PROVIDERS[token]
        if (provider) {
          if (provider.status) {
            const { pin, deals } = await provider.status(cid, {
              accessKey: env.get('GW3_ACCESS_KEY'),
              token: env.get(token),
            })
            log.pinStatus(provider.name, pin, deals)
          }
        }
      }
    },
  )

cli
  .command(
    'ens <cid> <domain>',
    'Update ENS name Content-Hash with an IFPS CID',
  )
  .option('--chain [chain]', 'Chain to use', { default: 'mainnet' })
  .action(
    async (
      cid: string,
      domain: string,
      { chain }: { chain: 'mainnet' | 'goerli' },
    ) => {
      const { walletClient, account, publicClient } = initializeEthereum({
        chain,
      })

      let hash: Hash = '0x'

      const balance = formatEther(
        await publicClient.getBalance({ address: account.address }),
      )

      log.transactionPrepared(account.address, balance.slice(0, 4))

      try {
        hash = await encodeIpfsHashAndUpdateEns({
          cid,
          domain,
          chain,
          walletClient,
          account,
          publicClient,
        })
      } catch (e) {
        if (e instanceof TransactionExecutionError) {
          if (e.details?.includes('insufficient funds')) {
            log.insufficientFunds(e.details)
          } else {
            log.transactionError(e.message)
          }
        } else if (e instanceof MissingKeyError) {
          log.missingKeyError(e.message)
        } else if (e instanceof Error) {
          if (e.message.includes('disallowed character'))
            log.invalidEnsDomain(domain, e.message)
          else if (e.message.includes('Incorrect length')) {
            log.invalidIpfsHash(cid)
          } else {
            log.unknownError(e.message)
          }
        } else {
          log.unknownError(e)
        }
        return
      }

      log.transactionPending(hash, chain)

      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
        timeout: 20_000,
      })

      if (receipt.status === 'reverted')
        return log.transactionReverted(receipt.transactionHash, chain)

      log.transactionSucceeded()
      return log.ensFinished(domain)
    },
  )

cli.help()
cli.version('0.0.0-dev.1')
cli.example('blumen deploy --strict ./dist')
cli.parse()
