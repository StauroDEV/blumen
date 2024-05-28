import { encode } from '@ensdomains/content-hash'
import { Address, parseAbi } from 'viem'
import { namehash, normalize } from 'viem/ens'
import type { ChainName } from '../types'

export const prepareUpdateEnsArgs = async ({ cid, domain }: { cid: string, domain: string }) => {
  const contentHash = encode('ipfs', cid)

  const node = namehash(normalize(domain))

  return { contentHash, node }
}

export const abi = parseAbi(['function setContenthash(bytes32 node, bytes calldata hash) external'])

export const PUBLIC_RESOLVER_ADDRESS: Record<ChainName, Address> = {
  mainnet: '0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63',
  sepolia: '0x8FADE66B79cC9f707aB26799354482EB93a5B7dD',
} as const

export const chainToRpcUrl = (chain: ChainName) => {
  switch (chain) {
    case 'mainnet':
      return 'https://rpc.ankr.com/eth'
    case 'sepolia':
      return 'https://rpc.ankr.com/eth_sepolia'
  }
}
