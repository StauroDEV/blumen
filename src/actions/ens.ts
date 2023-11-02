import {
  Hash,
  formatEther,
  TransactionExecutionError,
  Address,
  createWalletClient,
  http,
  createPublicClient,
  Hex,
  encodeFunctionData
} from 'viem'
import { MissingKeyError } from '../errors.js'
import { PUBLIC_RESOLVER_ADDRESS, prepareUpdateEnsArgs, abi } from '../utils/ens.js'
import * as log from '../log.js'
import { ChainName } from '../types.js'
import { privateKeyToAccount } from 'viem/accounts'
import { goerli, mainnet } from 'viem/chains'
import { walletSafeActions, publicSafeActions } from '@stauro/piggybank/actions'
import { EIP3770Address, OperationType } from '@stauro/piggybank/types'
import { ApiClient } from '@stauro/piggybank/api'
import { chainIdToSafeApiUrl } from '../utils/safe.js'

export const ensAction = async (
  cid: string,
  domain: string,
  {
    chain: chainName, safe: safeAddress, operationType 
  }: { chain: ChainName; } & Partial<{ safe: Address | EIP3770Address, operationType: OperationType }>,
) => {
  const chain = chainName === 'mainnet' ? mainnet : goerli
  const publicClient = createPublicClient({
    transport: http(),
    chain
  })


  const pk = process.env.BLUMEN_PK

  if (!pk) throw new MissingKeyError('PK')

  const account = privateKeyToAccount(pk as `0x${string}`)

  const walletClient = createWalletClient({
    transport: http(),
    chain,
    account
  })

  const contentHash: Hex = '0x',
    node: Hex = '0x'

  try {
    const result = await prepareUpdateEnsArgs({ cid, domain })
    result.contentHash = contentHash
    result.node = node
  } catch (e) {
    if ((e as Error).message.includes('disallowed character')) log.invalidEnsDomain(domain, (e as Error).message)
    else if ((e as Error).message.includes('Incorrect length')) {
      log.invalidIpfsHash(cid)
    } else {
      log.unknownError(e as Error)
    }
    
    return
  }

  const { request } = await publicClient.simulateContract({
    abi,
    functionName: 'setContenthash',
    account,
    address: PUBLIC_RESOLVER_ADDRESS[chain.id as 1 | 5],
    args: [node, `0x${contentHash}`],
    chain
  })

  const balance = formatEther(await publicClient.getBalance({ address: account.address }))

  log.transactionPrepared(account.address, balance.slice(0, 4))

  if (safeAddress) {
    log.preparingSafeTransaction(safeAddress)
    const safeWalletClient = walletClient.extend(walletSafeActions(safeAddress))
    const safePublicClient = publicClient.extend(publicSafeActions(safeAddress))

    const nonce = await safePublicClient.getSafeNonce()

    const txData = {
      to: request.address,
      data: encodeFunctionData({
        functionName: 'setContenthash',
        abi,
        args: [node, `0x${contentHash}`]
      }),
      operation: operationType ?? OperationType.Call,
      gasPrice: request.gasPrice!
    }

    const safeTxGas = await safePublicClient.estimateSafeTransactionGas(txData)

    const baseGas = await safePublicClient.estimateSafeTransactionBaseGas({ ...txData, safeTxGas })

    const safeTxHash = await safePublicClient.getSafeTransactionHash({ ...txData, safeTxGas, baseGas, nonce })

    log.generatingSafeSignature()

    const senderSignature = await safeWalletClient.generateSafeTransactionSignature({
      ...txData,
      nonce,
      safeTxGas,
      baseGas
    })

    const apiClient = new ApiClient({ url: chainIdToSafeApiUrl(chain.id), safeAddress })

    try {
      await apiClient.proposeTransaction({
        safeTransactionData: { ...txData, safeTxGas, baseGas, nonce },
        senderAddress: walletClient.account.address,
        safeTxHash,
        senderSignature,
        chainId: chain.id,
        origin: 'Piggybank',
        nonce
      })
    } catch (e) {
      log.proposalError(e as Error)
      return
    }
  } else {
    let hash: Hash = '0x'

    try {
      hash = await walletClient.sendTransaction(request)
    } catch (e) {
      if (e instanceof TransactionExecutionError) {
        if (e.details?.includes('insufficient funds')) {
          log.insufficientFunds(e.details)
        } else {
          log.transactionError(e.message)
        }
      } else {
        log.unknownError(e as Error)
      }
      return
    }

    log.transactionPending(hash, chainName)

    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
      timeout: 1000 * 60 * 30 // 30 minutes
    })

    if (receipt.status === 'reverted') return log.transactionReverted(receipt.transactionHash, chainName)
  }

  log.transactionSucceeded()
  return log.ensFinished(domain)
}
