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
import { walletSafeActions, getSafeNonce } from '@stauro/piggybank/actions'
import { EIP3770Address, OperationType, type SafeTransactionData } from '@stauro/piggybank/types'
import { getEip3770Address } from '@stauro/piggybank/utils'
import { ApiClient } from '@stauro/piggybank/api'
import { chainToSafeApiUrl, prepareSafeTransactionData } from '../utils/safe.js'
import * as colors from 'colorette'
import { logger } from '../utils/logger.js'
import { isTTY } from '../constants.js'
import { CID } from 'multiformats'

export type EnsActionArgs = Partial<{
  'chain': ChainName
  'safe': Address | EIP3770Address
  'rpcUrl': string
  'resolverAddress': Address
  'verbose': boolean
  'dry-run': boolean
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

  if (cid.length !== 64) {
    try {
      CID.parse(cid)
    }
    catch {
      throw new InvalidCIDError(cid)
    }
  }
  if (!domain) throw new MissingCLIArgsError([domain])
  const chain = chains[chainName] as chains.Chain

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
    const result = prepareUpdateEnsArgs({ cid, domain, codec: cid.length === 64 ? 'swarm' : 'ipfs' })
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

  const data = encodeFunctionData({
    functionName: 'setContenthash',
    abi,
    args: [node, `0x${contentHash}`],
  })

  if (options.verbose) {
    console.log('Transaction encoded data:', data)
  }
  const to = resolverAddress || PUBLIC_RESOLVER_ADDRESS[chainName]

  if (safeAddress) {
    logger.info(`Preparing a transaction for Safe ${safeAddress} on ${chainName}`)
    const safeWalletClient = walletClient.extend(walletSafeActions(safeAddress))

    const nonce = await getSafeNonce(publicClient, safeAddress)

    if (options.verbose) logger.info(`Nonce: ${nonce}`)

    const txData: SafeTransactionData = { nonce, operation: OperationType.Call, to, data, value: 0n }
    const { safeTxHash } = await prepareSafeTransactionData({
      txData,
      safeAddress,
      publicClient,
    })

    logger.info(`Signing a Safe transaction with a hash ${safeTxHash}`)

    const senderSignature = await safeWalletClient.generateSafeTransactionSignature(txData)

    if (!options['dry-run']) {
      logger.info('Proposing a Safe transaction')

      const apiClient = new ApiClient({ url: chainToSafeApiUrl(chainName), safeAddress, chainId: chain.id })

      try {
        await apiClient.proposeTransaction({
          safeTransactionData: { ...txData, gasPrice: 0n, safeTxGas: 0n },
          senderAddress: walletClient.account.address,
          safeTxHash,
          senderSignature,
          chainId: chain.id,
          origin: 'Blumen',
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
  }
  else {
    let hash: Hash = '0x'

    try {
      const request = await publicClient.prepareTransactionRequest({
        account: from,
        to,
        chain,
        data,
      })
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

    logger.info(`Transaction pending: ${chain.blockExplorers!.default.url}/tx/${hash}`)

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
