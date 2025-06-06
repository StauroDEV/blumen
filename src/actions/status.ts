import { CID } from 'multiformats/cid'
import { PROVIDERS } from '../constants.js'
import {
  InvalidCIDError,
  NoProvidersError,
  UnknownProviderError,
} from '../errors.js'
import { findEnvVarProviderName, parseTokensFromEnv } from '../index.js'
import { pinStatus } from '../utils/pin.js'

export const statusAction = async ({
  cid,
  options = {},
}: {
  cid: string
  options?: Partial<{ providers: string; verbose: boolean }>
}) => {
  const { providers: providersOptionList, verbose } = options
  // Validate CID
  try {
    CID.parse(cid)
  } catch {
    throw new InvalidCIDError(cid)
  }

  const env = parseTokensFromEnv()
  const tokens: string[] = []

  if (!providersOptionList)
    for (const option of env.keys()) {
      if (option?.endsWith('_TOKEN')) tokens.push(option)
    }

  if (providersOptionList) {
    for (const option of providersOptionList.split(',').map((s) => s.trim())) {
      const tokenName = findEnvVarProviderName(option)
      if (tokenName) tokens.push(tokenName)
      else throw new UnknownProviderError(option)
    }
  }

  if (tokens.length === 0) throw new NoProvidersError()

  const providers = tokens.map((token) => PROVIDERS[token])

  await Promise.all(
    providers.map(async (provider, i) => {
      const token = tokens[i]
      if (provider?.status) {
        const { pin } = await provider.status({
          cid,
          auth: {
            token: env.get(token),
          },
          verbose,
        })
        pinStatus(provider.name, pin)
      }
    }),
  )
}
