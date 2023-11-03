import varint from 'varint'
import { encode as cborEncode } from '@ipld/dag-cbor'
import { UnknownLink } from 'multiformats'
import { Block } from '@ipld/unixfs'
import { TransformStream } from 'node:stream/web'

function encodeHeader(roots: UnknownLink[]) {
  const headerBytes = cborEncode({ version: 1, roots })
  const varintBytes = varint.encode(headerBytes.length)
  const header = new Uint8Array(varintBytes.length + headerBytes.length)
  header.set(varintBytes, 0)
  header.set(headerBytes, varintBytes.length)
  return header
}

function encodeBlock(block: Block) {
  const varintBytes = varint.encode(block.cid.bytes.length + block.bytes.length)
  const bytes = new Uint8Array(
    varintBytes.length + block.cid.bytes.length + block.bytes.length,
  )
  bytes.set(varintBytes)
  bytes.set(block.cid.bytes, varintBytes.length)
  bytes.set(block.bytes, varintBytes.length + block.cid.bytes.length)
  return bytes
}

export class CAREncoderStream extends TransformStream<Block, Uint8Array> {
  finalBlock: Block | null
  constructor(roots: UnknownLink[] = []) {
    super({
      start: (controller) => controller.enqueue(encodeHeader(roots)),
      transform: (block, controller) => {
        controller.enqueue(encodeBlock(block))
        this.finalBlock = block
      }
    })
    this.finalBlock = null
  }
}
