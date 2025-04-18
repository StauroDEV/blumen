import { PROVIDERS, isTTY } from '../constants.js'
import { NoProvidersError } from '../errors.js'
import { parseTokensFromEnv, tokensToProviderNames, findEnvVarProviderName } from '../index.js'
import mod from 'ascii-bar'
import { EnsActionArgs, ensAction } from './ens.js'
import { deployMessage, logger } from '../utils/logger.js'
import * as colors from 'colorette'
import { dnsLinkAction } from './dnslink.js'
import { packAction, PackActionArgs } from './pack.js'
import { uploadOnSwarmy } from '../providers/swarmy.js'

const AsciiBar = mod.default

export type DeployActionArgs = Partial<{
  strict: boolean
  ens: string
  providers: string
  dnslink: string
}> & PackActionArgs & EnsActionArgs

export const deployAction = async (
  { dir, options = {} }: { dir?: string, options?: DeployActionArgs },
) => {
  const {
    strict, ens, chain = 'mainnet', safe, name: customName,
    dist, verbose = false, providers: providersList, resolverAddress,
    dnslink, rpcUrl,
  } = options

  const apiTokens = parseTokensFromEnv()

  const providerNames = providersList ? providersList.split(',') : tokensToProviderNames(apiTokens.keys())

  let swarmyProvider: typeof PROVIDERS[keyof typeof PROVIDERS] | undefined
  const providers = providerNames.reduce((acc, providerName) => {
    const envVarName = findEnvVarProviderName(providerName)!
    const provider = PROVIDERS[envVarName]

    if (providerName === 'Swarmy') {
      swarmyProvider = provider
    }
    else {
      acc.push(provider)
    }

    return acc
  }, [] as typeof PROVIDERS[keyof typeof PROVIDERS][])

  providers.sort((a) => {
    if (a.supported === 'both' || a.supported === 'upload') return -1
    else return 1
  })

  if (!providers.length) throw new NoProvidersError()

  if (swarmyProvider) logger.info(`Deploying with Swarmy`)
  else logger.info(`Deploying with providers: ${providers.map(p => p.name).join(', ')}`)

  let cid: string = undefined!

  const { name, cid: ipfsCid, blob } = await packAction({ dir, options: {
    name: customName, dist, verbose, tar: Boolean(swarmyProvider),
  } })

  if (!swarmyProvider) cid = ipfsCid!

  let total = 0

  const errors: Error[] = []
  const bar = isTTY
    ? new AsciiBar({
      total: swarmyProvider ? 1 : providers.length,
      formatString: '#spinner #bar #message',
      hideCursor: false,
      enableSpinner: true,
      width: process.stdout.columns - 30,
    })
    : undefined

  if (swarmyProvider) {
    bar?.update(total++, deployMessage('Swarmy', swarmyProvider.supported))
    const { cid: swarmCid, rID } = await uploadOnSwarmy({
      car: blob, token: apiTokens.get('SWARMY_TOKEN')!, verbose, cid: '', name: '', first: true,
    })
    cid = rID!
    bar?.update(total)
    logger.success('Deployed on Swarm')
    logger.info(`Swarm Reference ID: ${rID}`)
    console.log(`\nOpen in a browser: https://${swarmCid}.bzz.limo/ `)
  }
  else {
    for (const provider of providers) {
      const envVar = findEnvVarProviderName(provider.name)!
      const token = apiTokens.get(envVar)!

      bar?.update(total++, deployMessage(provider.name, PROVIDERS[envVar].supported))

      let bucketName: string | undefined

      if (envVar.includes('FILEBASE')) bucketName = apiTokens.get('FILEBASE_BUCKET_NAME')
      else if (envVar.includes('4EVERLAND')) bucketName = apiTokens.get('4EVERLAND_BUCKET_NAME')

      try {
        await PROVIDERS[envVar].upload({
          name,
          car: blob,
          token,
          bucketName,
          proof: apiTokens.get('STORACHA_PROOF'),
          cid,
          first: providers.indexOf(provider) === 0,
          verbose,
          baseURL: apiTokens.get('SPEC_URL'),
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

    const dwebLink = `https://${cid}.ipfs.dweb.link`
    const providersLink = `https://delegated-ipfs.dev/routing/v1/providers/${cid}`

    console.log(
      `\nOpen in a browser:\n${isTTY ? colors.bold('IPFS') : 'IPFS'}:      ${
        isTTY ? colors.underline(dwebLink) : dwebLink
      }\n${isTTY ? colors.bold('Providers') : 'Providers'}: ${
        isTTY ? colors.underline(providersLink) : providersLink
      }`,
    )
  }

  if (typeof ens === 'string') {
    console.log('\n')
    await ensAction({ cid, domain: ens, options: { chain, safe, resolverAddress, rpcUrl, verbose } })
  }

  if (dnslink) {
    if (swarmyProvider) throw new Error('DNSLink is not supported with Swarm')
    await dnsLinkAction({ cid, name: dnslink, options: { verbose } })
  }
}
