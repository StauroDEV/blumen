#!/usr/bin/env node

import { cac } from 'cac'
import { dirData, exists, fileSize } from './utils/fs.js'
import { packCAR } from './utils/ipfs.js'
import path from 'node:path'
import {
  findEnvVarProviderName,
  parseEnv,
  tokensToProviderNames,
} from './utils/env.js'
import * as log from './log.js'
import { PROVIDERS } from './constants.js'
import mod from 'ascii-bar'
import {
  InvalidCIDError,
  MissingDirectoryError,
  NoProvidersError,
  UnknownProviderError,
} from './errors.js'
import { CID } from 'multiformats/cid'

const AsciiBar = mod.default

const cli = cac()

cli
  .command('deploy [dir]', 'Deploy web content on IPFS')
  .option('--strict', 'Stop deploying if one of the providers fails', {
    default: true,
  })
  .action(async (dir, { strict }: { strict: boolean }) => {
    if (!dir) {
      if (await exists('dist')) dir = 'dist'
      else dir = '.'
    }
    const normalizedPath = path.join(process.cwd(), dir)
    const name = path.basename(normalizedPath)
    const [size, files] = await dirData(normalizedPath)

    if (size === 0) throw new MissingDirectoryError(dir)

    log.packing(dir === '.' ? name : dir, fileSize(size, 2))

    const { rootCID, blob } = await packCAR(files, name)

    log.root(rootCID)

    const apiTokens = parseEnv()

    const providers = tokensToProviderNames(apiTokens.keys())

    if (!providers.length) throw new NoProvidersError()

    log.providersList(providers)

    let total = 0

    const bar = new AsciiBar({
      total: providers.length,
      formatString: '#spinner #bar #message',
      hideCursor: true,
      enableSpinner: true,
      width: process.stdout.columns - 30,
    })

    const errors: Error[] = []

    for (const provider of providers) {
      const envVar = findEnvVarProviderName(provider)!
      const token = apiTokens.get(envVar)!

      if (providers.indexOf(provider) === 0) {
        bar.update(total++, `Uploading to ${provider}`)

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
        bar.update(total++, `Pinning to ${provider}`)

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
    bar.update(total) // finish

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
      { providers: providersOptionList }: { providers: string }
    ) => {
      // Validate CID
      try {
        CID.parse(cid)
      } catch {
        throw new InvalidCIDError(cid)
      }

      const env = parseEnv()
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
    }
  )

cli.help()
cli.version('0.0.0-dev.1')
cli.parse()
