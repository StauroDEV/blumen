import { ShardedDAGIndex } from '@storacha/blob-index'
import { Storefront } from '@storacha/filecoin-client'
import * as BlobAdd from '@storacha/upload-client/blob'
import * as CAR from '@storacha/upload-client/car'
import * as IndexAdd from '@storacha/upload-client/index'
import type {
  InvocationConfig,
  Position,
  SliceDigest,
} from '@storacha/upload-client/types'
import * as PieceHasher from '@web3-storage/data-segment/multihash'
import * as raw from 'multiformats/codecs/raw'
import { sha256 } from 'multiformats/hashes/sha2'
import * as Link from 'multiformats/link'
import type { BlobLike } from '../../types.js'
import * as Upload from './actions/upload-add.js'

/**
 * Minimal upload of a CAR as a single shard (no sharding, no dedupe, no progress callbacks).
 * Mirrors the non-streaming small-CAR path from @storacha/upload-client.
 */
export const uploadCAR = async (conf: InvocationConfig, car: BlobLike) => {
  // Decode incoming CAR to get blocks and root
  const { blocks, roots } = await CAR.decode(car)
  const root = roots[0]

  // Compute slices for a single CAR (no sharding)
  const slices: Map<SliceDigest, Position> = new Map()
  let currentLength = 0
  const emptyHeaderLength = CAR.headerEncodingLength()
  for (const block of blocks) {
    const blockHeaderLength = CAR.blockHeaderEncodingLength(block)
    slices.set(block.cid.multihash, [
      emptyHeaderLength + currentLength + blockHeaderLength,
      block.bytes.length,
    ])
    currentLength += blockHeaderLength + block.bytes.length
  }
  const headerLengthWithRoot = CAR.headerEncodingLength(root)
  const diff = headerLengthWithRoot - emptyHeaderLength
  if (diff !== 0) {
    for (const slice of slices.values()) slice[0] += diff
  }

  const singleCar = await CAR.encode(blocks, root)
  const bytes = new Uint8Array(await singleCar.arrayBuffer())
  const digest = await sha256.digest(bytes)

  await BlobAdd.add(conf, digest, bytes, {})

  const multihashDigest = PieceHasher.digest(bytes)
  const piece = Link.create(raw.code, multihashDigest)
  const content = Link.create(raw.code, digest)
  const offer = await Storefront.filecoinOffer(
    {
      issuer: conf.issuer,
      audience: conf.audience,
      with: conf.issuer.did(),
      proofs: conf.proofs,
    },
    content,
    piece,
    {},
  )
  if (offer.out?.error) {
    throw new Error(
      'failed to offer piece for aggregation into filecoin deal',
      {
        cause: offer.out.error,
      },
    )
  }

  // 3) Build and store DAG index for this single shard
  const carCid = Link.create(CAR.code, digest)
  const index = ShardedDAGIndex.create(root)
  // Add computed slices
  for (const [slice, pos] of slices) index.setSlice(digest, slice, pos)
  // Also include the CAR shard itself
  index.setSlice(digest, digest, [0, singleCar.size])

  const indexBytes = await index.archive()
  if (!indexBytes.ok) {
    throw new Error('failed to archive DAG index', { cause: indexBytes.error })
  }
  const indexDigest = await sha256.digest(indexBytes.ok)
  const indexLink = Link.create(CAR.code, indexDigest)

  await BlobAdd.add(conf, indexDigest, indexBytes.ok, {})

  await IndexAdd.add(conf, indexLink, {})
  await Upload.add(conf, root, [carCid])

  return root
}
