import { EIP3770Address, SafeTransactionData } from '@stauro/piggybank/types'
import type { ChainName } from '../types.js'
import { getSafeTransactionHash } from '@stauro/piggybank/actions'
import { Address, PublicClient } from 'viem'

export const chainToSafeApiUrl = (chainName: ChainName) => `https://safe-transaction-${chainName}.safe.global`

export const prepareSafeTransactionData = async ({
  txData, safeAddress, publicClient,
}: { txData: SafeTransactionData, publicClient: PublicClient, safeAddress: EIP3770Address | Address }) => {
  const safeTxHash = await getSafeTransactionHash(publicClient, safeAddress, txData)

  return { safeTxHash }
}
