import * as log from '../log.js'
import { CID } from 'multiformats'
import { PROVIDERS } from '../constants.js'
import {
  InvalidCIDError,
  UnknownProviderError,
  NoProvidersError,
} from '../errors.js'
import { parseTokensFromEnv, findEnvVarProviderName } from '../index.js'

export const statusAction = async (
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
    for (const option of providersOptionList.split(',').map((s) => s.trim())) {
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
}
