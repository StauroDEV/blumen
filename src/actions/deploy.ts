import path from 'node:path'
import { PROVIDERS, isTTY } from '../constants.js'
import { MissingDirectoryError, NoProvidersError } from '../errors.js'
import { walk, fileSize, packCAR, parseTokensFromEnv, tokensToProviderNames, findEnvVarProviderName } from '../index.js'
import { exists } from '../utils/fs.js'
import mod from 'ascii-bar'
import { EnsActionArgs, ensAction } from './ens.js'
import { deployMessage, logger } from '../utils/logger.js'
import * as colors from 'colorette'
import { dnsLinkAction } from './dnslink.js'

const AsciiBar = mod.default

export type DeployActionArgs = Partial<{
  strict: boolean
  ens: string
  name: string
  dist: string
  providers: string
  verbose: boolean
  dnslink: string
}> & EnsActionArgs

export const deployAction = async (
  { dir, options = {} }: { dir?: string, options?: DeployActionArgs },
) => {
  const {
    strict, ens, chain = 'mainnet', safe, name: customName,
    dist, verbose = false, providers: providersList, resolverAddress,
    dnslink, rpcUrl,
  } = options
  if (!dir) {
    if (await exists('dist')) dir = 'dist'
    else dir = '.'
  }
  const normalizedPath = path.join(process.cwd(), dir)
  const name = customName || path.basename(normalizedPath)
  const [size, files] = await walk(normalizedPath)

  if (size === 0) throw new MissingDirectoryError(dir)
  const distName = ['.', 'dist'].includes(dir) ? name : dir

  logger.start(`Packing ${isTTY ? colors.cyan(distName) : distName} (${fileSize(size, 2)})`)

  const { rootCID, blob } = await packCAR(files, name, dist)

  const cid = rootCID.toString()
  logger.info(`Root CID: ${isTTY ? colors.white(cid) : cid}`)

  const apiTokens = parseTokensFromEnv()

  const providers = providersList ? providersList.split(',') : tokensToProviderNames(apiTokens.keys())

  if (!providers.length) throw new NoProvidersError()

  logger.info(`Deploying with providers: ${providers.join(', ')}`)

  let total = 0

  const bar = isTTY
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
        proof: apiTokens.get('W3S_PROOF'),
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

  const dwebLink = `https://${cid}.ipfs.cf-ipfs.com`
  const providersLink = `https://delegated-ipfs.dev/routing/v1/providers/${cid}`

  console.log(
    `\nOpen in a browser:\n${isTTY ? colors.bold('IPFS') : 'IPFS'}:      ${
      isTTY ? colors.underline(dwebLink) : dwebLink
    }\n${isTTY ? colors.bold('Providers') : 'Providers'}: ${
      isTTY ? colors.underline(providersLink) : providersLink
    }`,
  )

  if (typeof ens === 'string') {
    console.log('\n')
    await ensAction({ cid, domain: ens, options: { chain, safe, resolverAddress, rpcUrl } })
  }

  if (dnslink) {
    await dnsLinkAction({ cid, name, options: { verbose } })
  }
}
