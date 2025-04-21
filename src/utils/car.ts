// import { FileLike } from '../types.js'
import * as UnixFS from '@ipld/unixfs'
// import { withMaxChunkSize } from '@ipld/unixfs/file/chunker/fixed'
// import { withWidth } from '@ipld/unixfs/file/layout/balanced'
import { UnknownLink } from 'multiformats'
// import * as raw from 'multiformats/codecs/raw'
import varint from 'varint'
import { encode as cborEncode } from '@ipld/dag-cbor'

// const SHARD_THRESHOLD = 1000 // shard directory after > 1,000 items
// const queuingStrategy = UnixFS.withCapacity()

// const defaultSettings = UnixFS.configure({
//   fileChunkEncoder: raw,
//   smallFileEncoder: raw,
//   chunker: withMaxChunkSize(1024 * 1024),
//   fileLayout: withWidth(1024),
// })

// class UnixFsFileBuilder {
//   #file

//   constructor(file: { stream: () => ReadableStream }) {
//     this.#file = file
//   }

//   async finalize(writer: UnixFS.View) {
//     const unixfsFileWriter = UnixFS.createFileWriter(writer)
//     await this.#file.stream().pipeTo(
//       new WritableStream({
//         async write(chunk) {
//           await unixfsFileWriter.write(chunk)
//         },
//       }),
//     )
//     return unixfsFileWriter.close()
//   }
// }

// class UnixFSDirectoryBuilder {
//   entries: Map<string, UnixFsFileBuilder | UnixFSDirectoryBuilder> = new Map()

//   async finalize(writer: UnixFS.View) {
//     const dirWriter = this.entries.size <= SHARD_THRESHOLD
//       ? UnixFS.createDirectoryWriter(writer)
//       /* c8 ignore next */
//       : UnixFS.createShardedDirectoryWriter(writer)
//     for (const [name, entry] of this.entries) {
//       const link = await entry.finalize(writer)
//       dirWriter.set(name, link)
//     }
//     return dirWriter.close()
//   }
// }

// export function createDirectoryEncoderStream(
//   files: Iterable<FileLike>, settings: UnixFS.EncoderSettings = defaultSettings,
// ): ReadableStream<UnixFS.Block> {
//   const rootDir = new UnixFSDirectoryBuilder()

//   for (const file of files) {
//     const path = file.name.split('/')
//     if (path[0] === '' || path[0] === '.') {
//       path.shift()
//     }
//     let dir = rootDir
//     for (const [i, name] of path.entries()) {
//       if (i === path.length - 1) {
//         dir.entries.set(name, new UnixFsFileBuilder(file))
//         break
//       }
//       let dirBuilder = dir.entries.get(name)
//       if (dirBuilder == null) {
//         dirBuilder = new UnixFSDirectoryBuilder()
//         dir.entries.set(name, dirBuilder)
//       }
//       if (!(dirBuilder instanceof UnixFSDirectoryBuilder)) {
//         throw new Error(`"${name}" cannot be a file and a directory`)
//       }
//       dir = dirBuilder
//     }
//   }

//   const { readable, writable } = new TransformStream<UnixFS.Block, UnixFS.Block>({}, queuingStrategy)
//   const unixfsWriter = UnixFS.createWriter({ writable, settings })
//   ;(async () => {
//     await rootDir.finalize(unixfsWriter)
//     await unixfsWriter.close()
//   })()

//   return readable
// }

function encodeHeader(roots: UnknownLink[]): Uint8Array {
  const headerBytes = cborEncode({ version: 1, roots })
  const varintBytes = varint.encode(headerBytes.length)
  const header = new Uint8Array(varintBytes.length + headerBytes.length)
  header.set(varintBytes, 0)
  header.set(headerBytes, varintBytes.length)
  return header
}

function encodeBlock(block: UnixFS.Block) {
  const varintBytes = varint.encode(block.cid.bytes.length + block.bytes.length)
  const bytes = new Uint8Array(varintBytes.length + block.cid.bytes.length + block.bytes.length)
  bytes.set(varintBytes)
  bytes.set(block.cid.bytes, varintBytes.length)
  bytes.set(block.bytes, varintBytes.length + block.cid.bytes.length)
  return bytes
}

export class CAREncoderStream extends TransformStream {
  finalBlock: UnixFS.Block | null
  constructor(roots: UnknownLink[] = []) {
    super({
      start: controller => controller.enqueue(encodeHeader(roots)),
      transform: (block, controller) => {
        controller.enqueue(encodeBlock(block))
        this.finalBlock = block
      },
    })
    this.finalBlock = null
  }
}
