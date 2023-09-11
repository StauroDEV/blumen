import { InvalidSafeAddress, InvalidTxHashError } from './errors.js'
import { getEip3770Address } from './getEip3770Address.js'
import { ProposeTransactionProps } from './types.js'
import { isHash, isAddress } from 'viem/utils'
import { sendRequest, HttpMethod } from './sendRequest.js'

export async function proposeTransaction({
  safeAddress,
  safeTransactionData,
  safeTxHash,
  senderAddress,
  senderSignature,
  origin,
  chainId,
  txServiceBaseUrl,
}: ProposeTransactionProps): Promise<void> {
  if (!isAddress(safeAddress)) {
    throw new InvalidSafeAddress(safeAddress)
  }
  const { address: safe } = await getEip3770Address({
    fullAddress: safeAddress,
    chainId,
  })
  const { address: sender } = await getEip3770Address({
    fullAddress: senderAddress,
    chainId,
  })
  if (!isHash(safeTxHash)) {
    throw new InvalidTxHashError(safeTxHash)
  }
  return sendRequest({
    url: `${txServiceBaseUrl}/v1/safes/${safe}/multisig-transactions/`,
    method: HttpMethod.Post,
    body: {
      ...safeTransactionData,
      contractTransactionHash: safeTxHash,
      sender,
      signature: senderSignature,
      origin,
    },
  })
}
