import { Secp256k1, TransactionEnvelopeEip1559 } from 'ox'
import { type AbiFunction, decodeResult } from 'ox/AbiFunction'
import type { Address } from 'ox/Address'
import type { Hex } from 'ox/Hex'
import type { Provider } from 'ox/Provider'

export const simulateTransaction = async ({
  provider,
  to,
  data,
  abi,
  from,
}: {
  provider: Provider
  to: Address
  data: Hex
  abi: AbiFunction
  from: Hex
}): Promise<boolean> => {
  const result = await provider.request({
    method: 'eth_call',
    params: [
      {
        to,
        data,
        from,
      },
      'latest',
    ],
  })

  return decodeResult(abi, result) as boolean
}

export const sendTransaction = async ({
  provider,
  chainId,
  privateKey,
  to,
  data,
  from,
}: {
  provider: Provider
  chainId: number
  privateKey: Hex
  to: Address
  data: Hex
  from: Hex
}) => {
  const feeHistory = await provider.request({
    method: 'eth_feeHistory',
    params: ['0x5', 'latest', [10, 50, 90]],
  })

  // Extract base fee and priority fee from feeHistory as needed
  const baseFeePerGas = BigInt(feeHistory.baseFeePerGas.slice(-1)[0])
  if (!feeHistory.reward) throw new Error('No reward in feeHistory')
  const priorityFeePerGas = BigInt(feeHistory.reward.slice(-1)[0][1]) // 50th percentile
  const maxPriorityFeePerGas = priorityFeePerGas
  const maxFeePerGas = baseFeePerGas * 2n + maxPriorityFeePerGas

  const envelope = TransactionEnvelopeEip1559.from({
    from,
    chainId,
    maxFeePerGas,
    maxPriorityFeePerGas,
    to,
    data,
    value: 0n,
  })

  const signature = Secp256k1.sign({
    payload: TransactionEnvelopeEip1559.getSignPayload(envelope),
    privateKey,
  })

  const serialized = TransactionEnvelopeEip1559.serialize(envelope, {
    signature,
  })

  return await provider.request({
    method: 'eth_sendRawTransaction',
    params: [serialized],
  })
}
