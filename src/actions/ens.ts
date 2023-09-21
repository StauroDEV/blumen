import { Hash, formatEther, TransactionExecutionError, Address, SendTransactionParameters } from 'viem'
import { MissingKeyError } from '../errors.js'
import { initializeEthereum, encodeIpfsHashAndUpdateEns } from '../utils/ens.js'
import * as log from '../log.js'
import { ChainName } from '../types.js'
import { SafeApiKit } from '../safe/ApiKit.js'
import { OperationType } from '../safe/types.js'
import { sendTransaction } from 'viem/actions'

export const ensAction = async (
  cid: string,
  domain: string,
  { chain: chainName, safe: safeAddress }: { chain: ChainName; safe: Address },
) => {
  const { walletClient, account, publicClient, chain } = initializeEthereum({
    chainName,
  })

  let request: SendTransactionParameters

  try {
    request = await encodeIpfsHashAndUpdateEns({
      cid,
      domain,
      chain,
      walletClient,
      account,
      publicClient,
    })
  } catch (e) {
    if (e instanceof MissingKeyError) log.missingKeyError(e.message)
    else if (e instanceof Error) {
      if (e.message.includes('disallowed character')) log.invalidEnsDomain(domain, e.message)
      else if (e.message.includes('Incorrect length')) {
        log.invalidIpfsHash(cid)
      } else {
        log.unknownError(e)
      }
    } else {
      log.unknownError(e)
    }
    return
  }

  const balance = formatEther(await publicClient.getBalance({ address: account.address }))

  log.transactionPrepared(account.address, balance.slice(0, 4))

  if (safeAddress) {
    const apiKit = new SafeApiKit({
      chainId: await walletClient.getChainId(),
      txServiceUrl: 'https://safe-transaction-mainnet.safe.global',
    })

    const tx = { operation: OperationType.Call }

    const sig = await walletClient.signTransaction({
      operation: OperationType.Call,
      ...request,
    })

    await apiKit.proposeTransaction({
      safeAddress,
      senderAddress: account.address,
      safeTransactionData: tx,
      senderSignature: sig,
    })
  } else {
    let hash: Hash = '0x'

    try {
      hash = await sendTransaction(walletClient, request)
    } catch (e) {
      if (e instanceof TransactionExecutionError) {
        if (e.details?.includes('insufficient funds')) {
          log.insufficientFunds(e.details)
        } else {
          log.transactionError(e.message)
        }
      } else {
        log.unknownError(e)
      }
      return
    }

    log.transactionPending(hash, chainName)

    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
      timeout: 1000 * 60 * 30, // 30 minutes
    })

    if (receipt.status === 'reverted') return log.transactionReverted(receipt.transactionHash, chain)
  }

  log.transactionSucceeded()
  return log.ensFinished(domain)
}
