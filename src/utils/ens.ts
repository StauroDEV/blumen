import { encode } from '@ensdomains/content-hash'
import { namehash, normalize } from 'viem/ens'
import { parseAbi } from 'viem/abi'
import { PrivateKeyAccount, privateKeyToAccount } from 'viem/accounts'
import { createPublicClient, http, createWalletClient, PublicClient, WalletClient } from 'viem'
import { goerli, mainnet } from 'viem/chains'
import { MissingKeyError } from '../errors.js'
import { ChainName } from '../types.js'
import { SimulateContractReturnType } from 'viem/contract'
import { Chain } from 'viem'

const abi = parseAbi(['function setContenthash(bytes32 node, bytes calldata hash) external'])

const PUBLIC_RESOLVER_ADDRESS = {
  1: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
  5: '0xd7a4F6473f32aC2Af804B3686AE8F1932bC35750',
} as const

export const initializeEthereum = ({
  chainName,
}: {
  chainName: ChainName
}): {
  walletClient: WalletClient
  account: PrivateKeyAccount
  publicClient: PublicClient
  chain: Chain
} => {
  const chain = chainName === 'mainnet' ? mainnet : goerli
  const publicClient = createPublicClient({
    transport: http(),
    chain,
  })

  const pk = process.env.BLUMEN_PK

  if (!pk) throw new MissingKeyError('PK')

  const account = privateKeyToAccount(pk as `0x${string}`)

  const walletClient = createWalletClient({
    transport: http(),
    chain,
    account,
  })

  return { walletClient, account, publicClient, chain }
}

export const encodeIpfsHashAndUpdateEns = async ({
  cid,
  domain,
  chain,
  account,
  publicClient,
  walletClient,
}: {
  cid: string
  domain: string
  chain: Chain
  account: PrivateKeyAccount
  publicClient: PublicClient
  walletClient: WalletClient
}): Promise<SimulateContractReturnType['request']> => {
  const contentHash = encode('ipfs', cid) as `0x${string}`

  const node = namehash(normalize(domain))

  const { request } = await publicClient.simulateContract({
    abi,
    functionName: 'setContenthash',
    account,
    address: PUBLIC_RESOLVER_ADDRESS[chain.id as 1 | 5],
    args: [node, `0x${contentHash}`],
    chain,
  })
  return request
}
