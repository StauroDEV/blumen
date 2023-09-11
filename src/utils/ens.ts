import { encode } from '@ensdomains/content-hash'
import { namehash, normalize } from 'viem/ens'
import { parseAbi } from 'viem/abi'
import { PrivateKeyAccount, privateKeyToAccount } from 'viem/accounts'
import { createPublicClient, http, createWalletClient } from 'viem'
import { goerli, mainnet } from 'viem/chains'
import { MissingKeyError } from '../errors.js'
import { PublicClient } from 'viem'
import { WalletClient } from 'viem'
import { Hash } from 'viem'
import { Chain } from '../types.js'

const abi = parseAbi([
  'function setContenthash(bytes32 node, bytes calldata hash) external',
])

const PUBLIC_RESOLVER_ADDRESS = {
  mainnet: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
  goerli: '0xd7a4F6473f32aC2Af804B3686AE8F1932bC35750',
} as const

export const initializeEthereum = ({
  chain,
}: {
  chain: Chain
}): {
  walletClient: WalletClient
  account: PrivateKeyAccount
  publicClient: PublicClient
} => {
  const publicClient = createPublicClient({
    transport: http(),
    chain: chain === 'mainnet' ? mainnet : goerli,
  })

  const pk = process.env.BLUMEN_PK

  if (!pk) throw new MissingKeyError('PK')

  const account = privateKeyToAccount(pk as `0x${string}`)

  const walletClient = createWalletClient({
    transport: http(),
    chain: chain === 'mainnet' ? mainnet : goerli,
    account,
  })

  return { walletClient, account, publicClient }
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
}): Promise<Hash> => {
  const contentHash = encode('ipfs', cid) as `0x${string}`

  const node = namehash(normalize(domain))

  const { request } = await publicClient.simulateContract({
    abi,
    functionName: 'setContenthash',
    account,
    address: PUBLIC_RESOLVER_ADDRESS[chain],
    args: [node, `0x${contentHash}`],
    chain: chain === 'mainnet' ? mainnet : goerli,
  })

  return await walletClient.writeContract(request)
}
