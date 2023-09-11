import { Hash, formatEther, TransactionExecutionError } from 'viem'
import { MissingKeyError } from '../errors.js'
import { initializeEthereum, encodeIpfsHashAndUpdateEns } from '../utils/ens.js'
import * as log from '../log.js'
import { Chain } from '../types.js'

export const ensAction = async (
  cid: string,
  domain: string,
  { chain }: { chain: Chain },
) => {
  const { walletClient, account, publicClient } = initializeEthereum({
    chain,
  })

  let hash: Hash = '0x'

  const balance = formatEther(
    await publicClient.getBalance({ address: account.address }),
  )

  log.transactionPrepared(account.address, balance.slice(0, 4))

  try {
    hash = await encodeIpfsHashAndUpdateEns({
      cid,
      domain,
      chain,
      walletClient,
      account,
      publicClient,
    })
  } catch (e) {
    if (e instanceof TransactionExecutionError) {
      if (e.details?.includes('insufficient funds')) {
        log.insufficientFunds(e.details)
      } else {
        log.transactionError(e.message)
      }
    } else if (e instanceof MissingKeyError) {
      log.missingKeyError(e.message)
    } else if (e instanceof Error) {
      if (e.message.includes('disallowed character'))
        log.invalidEnsDomain(domain, e.message)
      else if (e.message.includes('Incorrect length')) {
        log.invalidIpfsHash(cid)
      } else {
        log.unknownError(e.message)
      }
    } else {
      log.unknownError(e)
    }
    return
  }

  log.transactionPending(hash, chain)

  const receipt = await publicClient.waitForTransactionReceipt({
    hash,
    timeout: 1000 * 60 * 30, // 30 minutes
  })

  if (receipt.status === 'reverted')
    return log.transactionReverted(receipt.transactionHash, chain)

  log.transactionSucceeded()
  return log.ensFinished(domain)
}
