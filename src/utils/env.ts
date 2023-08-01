import { PROVIDERS } from '../constants.js'
import { UnknownProviderError } from '../errors.js'
import * as log from '../log.js'

export const parseEnvs = () => {
  const tokens = new Map<string, string>()

  for (const [key, value] of Object.entries(process.env)) {
    const prefix = `BLUMEN_`
    if (key.startsWith(prefix) && value) {
      tokens.set(key.slice(7), value)
    }
  }
  return tokens
}

// ESTUARY_TOKEN => Estuary
export const tokensToProviderNames = (keys: IterableIterator<string>) => {
  const providers: string[] = []
  for (const key of keys) {
    const provider = PROVIDERS[key]
    if (provider) providers.push(provider.name)
    else {
      throw new UnknownProviderError(key)
    }
  }
  return providers
}

// Estuary => ESTUARY_TOKEN
export const findEnvVarProviderName = (provider: string) => {
  for (const [token, { name }] of Object.entries(PROVIDERS)) {
    if (provider === name) return token
  }
}
