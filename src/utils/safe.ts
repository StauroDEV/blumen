import { EIP3770Address, SafeTransactionData } from '@stauro/piggybank/types'
import type { ChainName } from '../types.js'
import {
  estimateSafeTransactionGas, estimateSafeTransactionBaseGas, getSafeTransactionHash,
} from '@stauro/piggybank/actions'
import { Address, PublicClient } from 'viem'

export const chainToSafeApiUrl = (chainName: ChainName) => `https://safe-transaction-${chainName}.safe.global`

export const prepareSafeTransactionData = async ({
  txData, safeAddress, publicClient,
}: { txData: Omit<SafeTransactionData, 'safeTxGas' | 'baseGas'>
  publicClient: PublicClient
  safeAddress: EIP3770Address | Address
}) => {
  const safeTxGas = await estimateSafeTransactionGas(publicClient, safeAddress, txData)

  const baseGas = await estimateSafeTransactionBaseGas(publicClient, safeAddress, { ...txData, safeTxGas })

  const safeTxHash = await getSafeTransactionHash(publicClient, safeAddress, { ...txData, safeTxGas, baseGas })

  return { safeTxGas, baseGas, safeTxHash }
}
