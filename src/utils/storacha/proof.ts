import { CarReader } from '@ipld/car'
import type { Block } from '@ucanto/client'
import { extract, importDAG } from '@ucanto/core/delegation'
import * as CAR from '@ucanto/transport/car'
import { base64 } from 'multiformats/bases/base64'
import { identity } from 'multiformats/hashes/identity'
import * as Link from 'multiformats/link'

/**
 * Parses a base64 encoded CIDv1 CAR of proofs (delegations).
 */
export const parse = async (str: string) => {
  try {
    const cid = Link.parse(str, base64)
    if (cid.code !== CAR.codec.code) {
      throw new Error(`non CAR codec found: 0x${cid.code.toString(16)}`)
    }
    if (cid.multihash.code !== identity.code) {
      throw new Error(
        `non identity multihash: 0x${cid.multihash.code.toString(16)}`,
      )
    }

    try {
      const { ok, error } = await extract(cid.multihash.digest)
      if (error)
        throw new Error('failed to extract delegation', { cause: error })
      return ok
    } catch {
      // Before `delegation.archive()` we used `delegation.export()` to create
      // a plain CAR file of blocks.
      return legacyExtract(cid.multihash.digest)
    }
  } catch {
    // At one point we recommended piping output directly to base64 encoder:
    // `w3 delegation create did:key... --can 'store/add' | base64`
    return legacyExtract(base64.baseDecode(str))
  }
}

const legacyExtract = async (bytes: Uint8Array) => {
  const blocks = []
  const reader = await CarReader.fromBytes(bytes)
  for await (const block of reader.blocks()) {
    blocks.push(block)
  }
  return importDAG(blocks as Block[])
}
