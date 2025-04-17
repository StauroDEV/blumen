import { CID } from 'multiformats/cid'
import { Hex } from 'viem'
import { hexToBytes } from 'viem/utils'

import { create as createMultihashDigest } from 'multiformats/hashes/digest'

const KECCAK_256_CODEC = 0x1b
const SWARM_FEED_CODEC = 0xfb

export const referenceToCID = (ref: Hex) => {
  const hashBytes = hexToBytes(ref)

  return CID.createV1(SWARM_FEED_CODEC, createMultihashDigest(KECCAK_256_CODEC, hashBytes)).toString()
}
