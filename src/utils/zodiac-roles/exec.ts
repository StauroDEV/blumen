import { encodeData } from 'ox/AbiFunction'
import type { Address } from 'ox/Address'
import { toHex } from 'ox/Bytes'
import type { Hex } from 'ox/Hex'
import type { Provider } from 'ox/Provider'
import { logger } from '../logger.js'
import {
  sendTransaction,
  simulateTransaction,
  waitForTransaction,
} from '../tx.js'
import { ENS_DEPLOYER_ROLE } from './init.js'

const execTransactonWithRoleAbi = {
  inputs: [
    { internalType: 'address', name: 'to', type: 'address' },
    { internalType: 'uint256', name: 'value', type: 'uint256' },
    { internalType: 'bytes', name: 'data', type: 'bytes' },
    { internalType: 'enum Enum.Operation', name: 'operation', type: 'uint8' },
    { internalType: 'bytes32', name: 'roleKey', type: 'bytes32' },
    { internalType: 'bool', name: 'shouldRevert', type: 'bool' },
  ],
  name: 'execTransactionWithRole',
  outputs: [{ internalType: 'bool', name: 'success', type: 'bool' }],
  stateMutability: 'nonpayable',
  type: 'function',
} as const

export const execTransactonWithRole = async ({
  provider,
  resolverAddress,
  data: txData,
  rolesModAddress,
  from,
  privateKey,
  chainId,
  explorerUrl,
}: {
  provider: Provider
  resolverAddress: Address
  rolesModAddress: Address
  data: Hex
  from: Address
  privateKey: Address
  chainId: number
  explorerUrl: string
}) => {
  const data = encodeData(execTransactonWithRoleAbi, [
    resolverAddress,
    0n,
    txData,
    0, // CALL
    toHex(ENS_DEPLOYER_ROLE),
    false,
  ])

  const success = await simulateTransaction({
    provider,
    abi: execTransactonWithRoleAbi,
    to: rolesModAddress,
    data,
    from,
  })

  if (success) {
    const hash = await sendTransaction({
      privateKey,
      to: rolesModAddress,
      data,
      from,
      provider,
      chainId,
    })

    logger.info(`Transaction pending: ${explorerUrl}/tx/${hash}`)

    try {
      await waitForTransaction(provider, hash)
    } catch (e) {
      return logger.error(e)
    }

    logger.success('Transaction succeeded')
  }
}
