import type { ChainName } from '../types'

export const chainToSafeApiUrl = (chainName: ChainName) => `https://safe-transaction-${chainName}.safe.global`
