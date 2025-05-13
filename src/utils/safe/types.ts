import type { Address } from 'ox/Address'
import type { EIP3770Address } from './eip3770.js'
import type { Hex } from 'ox/Hex'

export enum OperationType {
  Call, // 0
  DelegateCall, // 1
}

export type SafeTransactionData = {
  to: Address | EIP3770Address
  value: bigint
  data: Hex
  operation: OperationType
  nonce: bigint
  safeTxGas?: bigint
  baseGas?: bigint
  gasPrice?: bigint
  gasToken?: Address
  refundReceiver?: Address
}
