import { parseAbi } from 'viem'
import { bytesToHex } from 'viem/utils'
import type { Address } from 'viem/accounts'
import { namehash, normalize } from 'viem/ens'
import type { ChainName } from '../types.js'
import varint from 'varint'
import { CID } from 'multiformats/cid'
import { referenceToCID } from './swarm.js'

const IFPS_CODEC = 0xe3
const SWARM_CODEC = 0xe4

const concatUint8Arrays = (
  array1: Uint8Array,
  array2: Uint8Array,
): Uint8Array => {
  let result = new Uint8Array(array1.length + array2.length)
  result.set(array1, 0)
  result.set(array2, array1.length)
  return result
}

export const prepareUpdateEnsArgs = ({
  cid, domain, codec = 'ipfs',
}: { cid: string, domain: string, codec?: 'ipfs' | 'swarm' }) => {
  const node = namehash(normalize(domain))
  const code = codec === 'ipfs' ? IFPS_CODEC : SWARM_CODEC

  let bytes: Uint8Array
  switch (codec) {
    case 'ipfs':
      bytes = CID.parse(cid).toV1().bytes
      break
    case 'swarm':
      bytes = referenceToCID(`0x${cid}`).bytes
      break
  }

  const codeBytes = Uint8Array.from(varint.encode(code))

  const contentHash = bytesToHex(concatUint8Arrays(codeBytes, bytes)).slice(2)

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
