import path from 'node:path'
import { PROVIDERS } from '../constants.js'
import { MissingDirectoryError, NoProvidersError } from '../errors.js'
import { walk, fileSize, packCAR, parseTokensFromEnv, tokensToProviderNames, findEnvVarProviderName } from '../index.js'
import { exists } from '../utils/fs.js'
import mod from 'ascii-bar'
import { ensAction } from './ens.js'
import { ChainName } from '../types.js'
import { Address } from 'viem'
import { deployMessage, logger } from '../utils/logger.js'
import * as colors from 'colorette'

const AsciiBar = mod.default

type DeployActionArgs = {
  strict: boolean
  chain?: ChainName
  ens?: string
  safe?: Address
  name?: string
  dist?: string
  providers?: string
  verbose?: boolean
}

export const deployAction = async (
  dir: string,
  { strict, ens, chain = 'mainnet', safe, name: customName, dist, verbose, providers: providersList }: DeployActionArgs,
) => {
  if (!dir) {
    if (await exists('dist')) dir = 'dist'
    else dir = '.'
  }
  const normalizedPath = path.join(process.cwd(), dir)
  const name = customName || path.basename(normalizedPath)
  const [size, files] = await walk(normalizedPath)

  if (size === 0) throw new MissingDirectoryError(dir)

  logger.start(`Packing ${colors.cyan(dir === '.' ? name : dir)} (${fileSize(size, 2)})`)

  const { rootCID, blob } = await packCAR(files, name, dist)

  const cid = rootCID.toString()
  logger.info(`Root CID: ${colors.white(cid)}`)

  const apiTokens = parseTokensFromEnv()

  const providers = providersList ? providersList.split(',') : tokensToProviderNames(apiTokens.keys())

  if (!providers.length) throw new NoProvidersError()

  logger.info(`Deploying with providers: ${providers.join(', ')}`)

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

    bar?.update(total++, deployMessage(provider, PROVIDERS[envVar].supported))

    try {
      await PROVIDERS[envVar].upload({
        name,
        car: blob,
        token,
        accessKey: apiTokens.get('GW3_ACCESS_KEY'),
        bucketName: apiTokens.get('FILEBASE_BUCKET_NAME'),
        cid,
        first: providers.indexOf(provider) === 0,
        verbose,
      })
    }
    catch (e) {
      if (strict) throw e
      else errors.push(e as Error)
    }
  }
  bar?.update(total)

  if (errors.length === providers.length) {
    logger.error('Deploy failed')
    errors.forEach(e => logger.error(e))
    return
  }
  else if (errors.length) {
    logger.warn('There were some problems with deploying')
    errors.forEach(e => logger.error(e))
  }
  else logger.success('Deployed across all providers')

  console.log(
    `\nOpen in a browser:\n${colors.bold('IPFS')}:      ${colors.underline(
      `https://${cid}.ipfs.dweb.link`,
    )}\n${colors.bold('IPFS Scan')}: ${colors.underline(
      `https://ipfs-scan.io/?cid=${cid}`,
    )}`,
  )

  if (typeof ens === 'string') {
    console.log('\n')
    await ensAction(cid, ens, { chain, safe })
  }
}
