import type { Address, Hash } from 'viem'

enum OperationType {
  Call, // 0
  DelegateCall, // 1
}

interface MetaTransactionData {
  to: Address
  value: string
  data: string
  operation?: OperationType
}

interface SafeTransactionData extends MetaTransactionData {
  operation: OperationType
  safeTxGas: string
  baseGas: string
  gasPrice: string
  gasToken: string
  refundReceiver: string
  nonce: number
}

export type ProposeTransactionProps = {
  safeAddress: Address
  safeTransactionData: SafeTransactionData
  safeTxHash: Hash
  senderAddress: Address
  senderSignature: string
  origin?: string
  chainId: number
  txServiceBaseUrl: `https://${string}`
}

export interface Eip3770Address {
  prefix: string
  address: string
}
