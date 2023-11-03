import { encode } from '@ensdomains/content-hash'
import { parseAbi } from 'viem/abi'
import { namehash, normalize } from 'viem/ens'

export const prepareUpdateEnsArgs = async ({ cid, domain }: { cid: string; domain: string }) => {
  const contentHash = encode('ipfs', cid)
 
  const node = namehash(normalize(domain))

  return { contentHash, node }
}

export const abi = parseAbi(['function setContenthash(bytes32 node, bytes calldata hash) external'])

export const PUBLIC_RESOLVER_ADDRESS = {
  1: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
  5: '0xd7a4F6473f32aC2Af804B3686AE8F1932bC35750'
} as const
