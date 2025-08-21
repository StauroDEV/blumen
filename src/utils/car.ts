import type { Block } from '@ipld/car/reader'
import { encode as cborEncode } from '@ipld/dag-cbor'
import type { UnknownLink } from 'multiformats'
import * as varint from 'varint'

export function encodeCARHeader(roots: UnknownLink[]): Uint8Array {
  const headerBytes = cborEncode({ version: 1, roots })
  const varintBytes = varint.encode(headerBytes.length)
  const header = new Uint8Array(varintBytes.length + headerBytes.length)
  header.set(varintBytes, 0)
  header.set(headerBytes, varintBytes.length)
  return header
}

export function encodeCARBlock({
  cid: { bytes: cidBytes },
  bytes: blockBytes,
}: Block) {
  const size = varint.encode(cidBytes.length + blockBytes.length)
  const bytes = new Uint8Array(
    size.length + cidBytes.length + blockBytes.length,
  )
  bytes.set(size)
  bytes.set(cidBytes, size.length)
  bytes.set(blockBytes, size.length + cidBytes.length)
  return bytes
}
