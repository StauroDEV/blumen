import { isAddress, isHash } from 'viem'
import { SafeTransactionData } from './types.js'
import { getEip3770Address } from './utils.js'
import { Address } from 'viem'
import { Hash } from 'viem'
import { InvalidSafeAddress, InvalidTxHashError } from './errors.js'

enum HttpMethod {
  Get = 'get',
  Post = 'post',
  Delete = 'delete',
}

interface HttpRequest {
  url: string
  method: HttpMethod
  body?: any
}

async function sendRequest<T>({ url, method, body }: HttpRequest): Promise<T> {
  const response = await fetch(url, {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  let jsonResponse: any
  try {
    jsonResponse = await response.json()
  } catch (error) {
    if (!response.ok) {
      throw new Error(response.statusText)
    }
  }

  if (response.ok) {
    return jsonResponse as T
  }
  if (jsonResponse.data) {
    throw new Error(jsonResponse.data)
  }
  if (jsonResponse.detail) {
    throw new Error(jsonResponse.detail)
  }
  if (jsonResponse.message) {
    throw new Error(jsonResponse.message)
  }
  if (jsonResponse.nonFieldErrors) {
    throw new Error(jsonResponse.nonFieldErrors)
  }
  if (jsonResponse.delegate) {
    throw new Error(jsonResponse.delegate)
  }
  if (jsonResponse.safe) {
    throw new Error(jsonResponse.safe)
  }
  if (jsonResponse.delegator) {
    throw new Error(jsonResponse.delegator)
  }
  throw new Error(response.statusText)
}

type ProposeTransactionProps = {
  safeAddress: Address
  safeTransactionData: SafeTransactionData
  safeTxHash: Hash
  senderAddress: Address
  senderSignature: string
  origin?: string
}

function getTxServiceBaseUrl(txServiceUrl: string): string {
  return `${txServiceUrl}/api`
}

interface SafeApiKitConfig {
  /** txServiceUrl - Safe Transaction Service URL */
  txServiceUrl: string
  chainId: number
}

export class SafeApiKit {
  #txServiceBaseUrl: string
  chainId: number

  constructor({ txServiceUrl, chainId }: SafeApiKitConfig) {
    this.#txServiceBaseUrl = getTxServiceBaseUrl(txServiceUrl)
    this.chainId = chainId
  }
  /**
   * Creates a new multi-signature transaction with its confirmations and stores it in the Safe Transaction Service.
   *
   * @param proposeTransactionConfig - The configuration of the proposed transaction
   * @returns The hash of the Safe transaction proposed
   * @throws "Invalid Safe address"
   * @throws "Invalid safeTxHash"
   * @throws "Invalid data"
   * @throws "Invalid ethereum address/User is not an owner/Invalid signature/Nonce already executed/Sender is not an owner"
   */
  async proposeTransaction({
    safeAddress,
    safeTransactionData,
    safeTxHash,
    senderAddress,
    senderSignature,
    origin,
  }: ProposeTransactionProps): Promise<void> {
    if (!isAddress(safeAddress)) {
      throw new InvalidSafeAddress(safeAddress)
    }

    const { address: safe } = await getEip3770Address({
      fullAddress: safeAddress,
      chainId: this.chainId,
    })
    const { address: sender } = await getEip3770Address({
      fullAddress: senderAddress,
      chainId: this.chainId,
    })
    if (!isHash(safeTxHash)) {
      throw new InvalidTxHashError(safeTxHash)
    }
    return sendRequest({
      url: `${this.#txServiceBaseUrl}/v1/safes/${safe}/multisig-transactions/`,
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
}
