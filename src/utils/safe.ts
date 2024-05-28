import type { ChainName } from '../types.js'

export const chainToSafeApiUrl = (chainName: ChainName) => `https://safe-transaction-${chainName}.safe.global`
