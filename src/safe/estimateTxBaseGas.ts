import { zeroAddress } from 'viem'
import { SafeTransaction } from './types.js'
import { getSafeContract } from './getSafeContract.js'
import { Safe } from './Safe.js'
import {
  CALL_DATA_ZERO_BYTE_GAS_COST,
  CALL_DATA_BYTE_GAS_COST,
  GAS_COST_PER_SIGNATURE,
  INCREMENT_NONCE_GAS_COST,
  INITIZATION_GAS_COST,
  HASH_GENERATION_GAS_COST,
  TRANSFER_GAS_COST,
} from './constants.js'

function estimateDataGasCosts(data: string): number {
  const bytes = data.match(/.{2}/g) as string[]

  return bytes.reduce((gasCost: number, currentByte: string) => {
    if (currentByte === '0x') {
      return gasCost + 0
    }

    if (currentByte === '00') {
      return gasCost + CALL_DATA_ZERO_BYTE_GAS_COST
    }

    return gasCost + CALL_DATA_BYTE_GAS_COST
  }, 0)
}

/**
 * This function estimates the baseGas of a Safe transaction.
 * The baseGas includes costs for:
 * - Generation of the Safe transaction hash (txHash)
 * - Increasing the nonce of the Safe
 * - Verifying the signatures of the Safe transaction
 * - Payment to relayers for executing the transaction
 * - Emitting events ExecutionSuccess or ExecutionFailure
 *
 */
export async function estimateTxBaseGas(safe: Safe, safeTransaction: SafeTransaction): Promise<string> {
  const safeTransactionData = safeTransaction.data
  const { to, value, data, operation, safeTxGas, gasToken, refundReceiver } = safeTransactionData

  const encodeSafeTxGas = safeTxGas || 0
  const encodeBaseGas = 0
  const gasPrice = 1
  const encodeGasToken = gasToken || zeroAddress
  const encodeRefundReceiver = refundReceiver || zeroAddress
  const signatures = '0x'

  const isL1SafeMasterCopy = safe.getContractManager().isL1SafeMasterCopy

  const safeSingletonContract = await getSafeContract({
    publicClient: safe.publicClient,
    isL1SafeMasterCopy,
    safeVersion,
    chain,
    walletClient,
    account,
  })

  const safeThreshold = await safeSingletonContract.getThreshold()
  const safeNonce = await safeSingletonContract.getNonce()

  const signaturesGasCost = safeThreshold * GAS_COST_PER_SIGNATURE

  const execTransactionData: string = safeSingletonContract.encode('execTransaction', [
    to,
    value,
    data,
    operation,
    encodeSafeTxGas,
    encodeBaseGas,
    gasPrice,
    encodeGasToken,
    encodeRefundReceiver,
    signatures,
  ])

  // If nonce == 0, nonce storage has to be initialized
  const isSafeInitialized = safeNonce !== 0n
  const incrementNonceGasCost = BigInt(isSafeInitialized ? INCREMENT_NONCE_GAS_COST : INITIZATION_GAS_COST)

  let baseGas =
    signaturesGasCost +
    BigInt(estimateDataGasCosts(execTransactionData)) +
    incrementNonceGasCost +
    BigInt(HASH_GENERATION_GAS_COST)

  // Add additional gas costs
  baseGas > 65536 ? (baseGas += 64n) : (baseGas += 128n)

  // Base tx costs, transfer costs...
  baseGas += BigInt(TRANSFER_GAS_COST)

  return baseGas.toString()
}
