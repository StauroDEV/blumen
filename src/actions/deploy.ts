import path from 'node:path'
import { PROVIDERS } from '../constants.js'
import { MissingDirectoryError, NoProvidersError } from '../errors.js'
import {
  walk,
  fileSize,
  packCAR,
  parseTokensFromEnv,
  tokensToProviderNames,
  findEnvVarProviderName,
} from '../index.js'
import { exists } from '../utils/fs.js'
import mod from 'ascii-bar'
import * as log from '../log.js'
import { ensAction } from './ens.js'

const AsciiBar = mod.default

export const deployAction = async (
  dir: string,
  {
    strict,
    ens,
    chain = 'mainnet',
    name,
    dist,
  }: {
    strict: boolean
    chain?: 'mainnet' | 'goerli'
    ens?: string
    name?: string
    dist?: string
  },
) => {
  if (!dir) {
    if (await exists('dist')) dir = 'dist'
    else dir = '.'
  }
  const normalizedPath = path.join(process.cwd(), dir)
  name = name || path.basename(normalizedPath)
  const [size, files] = await walk(normalizedPath)

  if (size === 0) throw new MissingDirectoryError(dir)

  log.packing(dir === '.' ? name : dir, fileSize(size, 2))

  const { rootCID, blob } = await packCAR(files, name, dist)

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

  /* WIP GNOSIS INTEGRATION */

  log.deployFinished(rootCID.toString())

  if (typeof ens === 'string') {
    console.log('\n')
    await ensAction(rootCID.toString(), ens, { chain })
  }
}
