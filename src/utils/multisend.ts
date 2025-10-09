import { encodeData } from 'ox/AbiFunction'
import type { Address } from 'ox/Address'
import {
  concat,
  fromArray,
  fromHex,
  fromNumber,
  padLeft,
  toHex,
} from 'ox/Bytes'
import type { Hex } from 'ox/Hex'

/**
 * Encodes a single CALL operation for Gnosis MultiSend.
 * Operation is always CALL (0).
 */
export const encodeMultiSendCall = ({
  to,
  data,
}: {
  to: Address
  data: Hex
}): Uint8Array => {
  const operation = fromArray([0]) // 1 byte
  const toBytes = padLeft(fromHex(to), 20) // 20 bytes
  const valueBytes = padLeft(fromNumber(0), 32) // 32 bytes
  const dataBytes = fromHex(data) // N bytes
  const dataLenBytes = padLeft(fromNumber(dataBytes.length), 32) // 32 bytes

  return concat(operation, toBytes, valueBytes, dataLenBytes, dataBytes)
}

const multiSendAbi = {
  name: 'multiSend',
  type: 'function',
  stateMutability: 'payable',
  inputs: [{ name: 'transactions', type: 'bytes' }],
  outputs: [],
} as const

export const encodeMultiSendCalldata = (txs: Uint8Array[]) =>
  encodeData(multiSendAbi, [toHex(concat(...txs))])
