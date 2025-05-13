import { Address, checksum } from 'ox/Address'
import { chainToSafeApiUrl } from '../safe.js'
import { EIP3770Address, getEip3770Address } from './eip3770.js'
import { SafeTransactionData } from './types.js'
import { ChainName } from '../../types.js'
import { Hex } from 'ox/Hex'

export const proposeTransaction = async ({
  txData,
  safeAddress,
  chainName,
  address,
  safeTxHash,
  senderSignature,
  chainId,
}: {
  txData: SafeTransactionData
  safeAddress: Address | EIP3770Address
  chainName: ChainName
  address: Address
  safeTxHash: Hex
  senderSignature: Hex
  chainId: number
}) => {
  // In order to serialize BigInt
  Object.defineProperty(BigInt.prototype, 'toJSON', {
    get() {
      'use strict'
      return () => String(this)
    },
  })

  const { address: safe } = getEip3770Address({ fullAddress: safeAddress, chainId })

  const res = await fetch(`${chainToSafeApiUrl(chainName)}/api/v1/safes/${safe}/multisig-transactions/`, {
    method: 'POST',
    body: JSON.stringify({
      ...txData,
      contractTransactionHash: safeTxHash,
      sender: checksum(address),
      signature: senderSignature,
      origin: 'Blumen',
      value: txData.value ?? 0n,
      baseGas: txData.baseGas ?? 0n,
      gasPrice: txData.gasPrice ?? 0n,
      safeTxGas: txData.safeTxGas ?? 0n,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) {
    const json = await res.json()
    throw new Error(json.message, { cause: json })
  }

  const text = await res.text()
  console.log(text)
}
