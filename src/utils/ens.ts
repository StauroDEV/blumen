import { Codec, encode } from '@ensdomains/content-hash'
import { parseAbi } from 'viem'
import type { Address } from 'viem/accounts'
import { namehash, normalize } from 'viem/ens'
import type { ChainName } from '../types.js'

export const prepareUpdateEnsArgs = ({
  cid, domain, codec = 'ipfs',
}: { cid: string, domain: string, codec?: Codec }) => {
  const contentHash = encode(codec, cid)

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
      return 'https://ethereum-rpc.publicnode.com'
    case 'sepolia':
      return 'https://ethereum-sepolia-rpc.publicnode.com'
  }
}
