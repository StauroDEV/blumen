import { CID } from 'multiformats/cid'

import { create as createMultihashDigest } from 'multiformats/hashes/digest'
import { type Hex, toBytes } from 'ox/Hex'

const KECCAK_256_CODEC = 0x1b
const SWARM_MANIFEST_CODEC = 0xfa

export const referenceToCID = (ref: Hex): CID => {
  const hashBytes = toBytes(ref)

  return CID.createV1(
    SWARM_MANIFEST_CODEC,
    createMultihashDigest(KECCAK_256_CODEC, hashBytes),
  )
}
