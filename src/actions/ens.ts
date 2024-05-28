import {
  Hash,
  TransactionExecutionError,
  Address,
  createWalletClient,
  http,
  createPublicClient,
  Hex,
  encodeFunctionData,
} from 'viem'
import { InvalidCIDError, MissingCLIArgsError, MissingKeyError } from '../errors.js'
import { PUBLIC_RESOLVER_ADDRESS, prepareUpdateEnsArgs, abi, chainToRpcUrl } from '../utils/ens.js'
import type { ChainName } from '../types.js'
import { privateKeyToAccount } from 'viem/accounts'
import * as chains from 'viem/chains'
import { walletSafeActions, publicSafeActions } from '@stauro/piggybank/actions'
import { EIP3770Address, OperationType } from '@stauro/piggybank/types'
import { getEip3770Address } from '@stauro/piggybank/utils'
import { ApiClient } from '@stauro/piggybank/api'
import { chainToSafeApiUrl } from '../utils/safe.js'
import * as colors from 'colorette'
import { logger } from '../utils/logger.js'
import { isTTY } from '../constants.js'
import { CID } from 'multiformats'

export type EnsActionArgs = Partial<{
  chain: ChainName
  safe: Address | EIP3770Address
  rpcUrl: string
  resolverAddress: Address
}>

export const ensAction = async (
  { cid, domain, options = {} }: {
    cid: string
    domain: string
    options: EnsActionArgs
  },
) => {
  const {
    chain: chainName = 'mainnet', safe: safeAddress, rpcUrl, resolverAddress,
  } = options

  try {
    CID.parse(cid)
  }
  catch {
    throw new InvalidCIDError(cid)
  }
  if (!domain) throw new MissingCLIArgsError([domain])
  const chain = chains[chainName]

  const transport = http(rpcUrl ?? chainToRpcUrl(chainName))

  const publicClient = createPublicClient({
    transport,
    chain,
  })

  const pk = process.env.BLUMEN_PK

  if (!pk) throw new MissingKeyError('PK')

  const account = privateKeyToAccount(pk.startsWith('0x') ? pk as `0x${string}` : `0x${pk}`)

  const walletClient = createWalletClient({
    transport,
    chain,
    account,
  })

  let contentHash = '',
    node: Hex = '0x'

  try {
    const result = await prepareUpdateEnsArgs({ cid, domain })
    contentHash = result.contentHash
    node = result.node
  }
  catch (e) {
    if ((e as Error).message.includes('disallowed character')) logger.error(`Invalid ENS domain: ${domain}`, e)
    else if ((e as Error).message.includes('Incorrect length')) {
      logger.error(`Invalid IPFS CID: ${cid}`, e)
    }
    else {
      logger.error(e)
    }
    return
  }

  logger.info(`Validating transaction for wallet ${account.address}`)

  const from = safeAddress
    ? getEip3770Address({ fullAddress: safeAddress, chainId: chain.id }).address
    : account.address

  const request = await publicClient.prepareTransactionRequest({
    account: from,
    to: resolverAddress || PUBLIC_RESOLVER_ADDRESS[chainName],
    chain,
    data: encodeFunctionData({
      functionName: 'setContenthash',
      abi,
      args: [node, `0x${contentHash}`],
    }),
  })

  if (safeAddress) {
    logger.info(`Preparing a transaction for Safe ${safeAddress}`)
    const safeWalletClient = walletClient.extend(walletSafeActions(safeAddress))

    const safePublicClient = publicClient.extend(publicSafeActions(safeAddress))

    const nonce = await safePublicClient.getSafeNonce()

    const txData = {
      ...request,
      to: request.to as Address,
      operation: OperationType.Call,
      gasPrice: request.gasPrice ?? 0n,
      nonce,
    }

    const safeTxGas = await safePublicClient.estimateSafeTransactionGas(txData)

    const baseGas = await safePublicClient.estimateSafeTransactionBaseGas({ ...txData, safeTxGas })

    const safeTxHash = await safePublicClient.getSafeTransactionHash({ ...txData, safeTxGas, baseGas })

    logger.info('Signing a Safe transaction')

    const senderSignature = await safeWalletClient.generateSafeTransactionSignature({
      ...txData,
      safeTxGas,
      baseGas,
    })

    logger.info('Proposing a Safe transaction')

    const apiClient = new ApiClient({ url: chainToSafeApiUrl(chainName), safeAddress, chainId: chain.id })

    try {
      await apiClient.proposeTransaction({
        safeTransactionData: { ...txData, safeTxGas, baseGas, nonce },
        senderAddress: walletClient.account.address,
        safeTxHash,
        senderSignature,
        chainId: chain.id,
        origin: 'Piggybank',
      })
      const safeLink = `https://app.safe.global/transactions/queue?safe=${safeAddress}`
      logger.success(`Transaction proposed to a Safe wallet.\nOpen in a browser: ${
       isTTY ? colors.underline(safeLink) : safeLink
      }`)
    }
    catch (e) {
      logger.error('Failed to propose a transaction', e)
      return
    }
  }
  else {
    let hash: Hash = '0x'

    try {
      // @ts-expect-error no clue how to fix it
      hash = await walletClient.sendTransaction(request)
    }
    catch (e) {
      if (e instanceof TransactionExecutionError) {
        if (e.details?.includes('insufficient funds')) {
          logger.error('Insufficient funds', e)
        }
        else {
          logger.error('Transaction failed', e)
        }
      }
      else {
        logger.error(e)
      }
      return
    }

    logger.info(`Transaction pending: ${chain.blockExplorers.default.url}/tx/${hash}`)

    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
      timeout: 1000 * 60 * 30, // 30 minutes
    })

    if (receipt.status === 'reverted') return logger.error('Transaction reverted')

    logger.success('Transaction submitted')
    const browserLink = `https://${domain}.limo`
    logger.info(`Open in a browser: ${isTTY ? colors.underline(browserLink) : browserLink}`)
  }
  return process.exit()
}
