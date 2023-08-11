#!/usr/bin/env node

import { cac } from 'cac'
import { dirData, exists, fileSize } from './utils/fs.js'
import { packCAR } from './utils/ipfs.js'
import path from 'node:path'
import {
  findEnvVarProviderName,
  parseEnvs,
  tokensToProviderNames,
} from './utils/env.js'
import * as log from './log.js'
import { PROVIDERS } from './constants.js'
import mod from 'ascii-bar'
import {
  InvalidCIDError,
  MissingDirectoryError,
  NoProvidersError,
} from './errors.js'
import { CID } from 'multiformats/cid'

const AsciiBar = mod.default

const cli = cac()

cli
  .command('deploy [dir]', 'Deploy web content on IPFS')
  .action(async (dir, {}) => {
    if (!dir) {
      if (await exists('dist')) dir = 'dist'
      else dir = '.'
    }
    const normalizedPath = path.join(process.cwd(), dir)
    const name = path.basename(normalizedPath)
    const [size, files] = await dirData(normalizedPath)

    if (size === 0) throw new MissingDirectoryError(dir)

    console.log(files)

    log.packing(dir === '.' ? name : dir, fileSize(size, 2))

    const { rootCID, blob } = await packCAR(files, name)

    log.root(rootCID)

    const apiTokens = parseEnvs()

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

    for (const provider of providers) {
      const envVar = findEnvVarProviderName(provider)!
      const token = apiTokens.get(envVar)!
      if (providers.indexOf(provider) === 0) {
        bar.update(total++, `Uploading to ${provider}`)

        await PROVIDERS[envVar]!.upload({
          name,
          car: blob,
          token,
          accessKey: apiTokens.get('GW3_ACCESS_KEY'),
        })
      } else {
        bar.update(total++, `Pinning to ${provider}`)

        await PROVIDERS[envVar]!.upload({
          name,
          cid: rootCID.toString(),
          token,
          accessKey: apiTokens.get('GW3_ACCESS_KEY'),
        })
      }
    }
    bar.update(total) // finish
    log.uploadFinished()

    /* WIP ENS + GNOSIS INTEGRATION */

    log.deployFinished(rootCID.toString())
  })

cli
  .command('status <cid>', 'Check IPFS pinning status')
  .action(async (cid: string) => {
    const apiTokens = parseEnvs()

    try {
      CID.parse(cid)
    } catch {
      throw new InvalidCIDError(cid)
    }

    for (const token of apiTokens.keys()) {
      const provider = PROVIDERS[token]
      if (provider) {
        if (provider.status) {
          const { pin, deals } = await provider.status(cid, {
            accessKey: apiTokens.get('GW3_ACCESS_KEY'),
            token: apiTokens.get(token),
          })
          log.pinStatus(provider.name, pin, deals)
        }
      }
    }
  })

cli.help()
cli.version('0.0.0')
cli.parse()
