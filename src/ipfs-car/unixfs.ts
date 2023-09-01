import { View } from '@ipld/unixfs'
import * as UnixFS from '@ipld/unixfs'
import * as raw from 'multiformats/codecs/raw'
import {
  TransformStream,
  ReadableStream,
  QueuingStrategy,
  WritableStream,
} from 'node:stream/web'
import { BlobLike, FileLike } from '../types.js'

const SHARD_THRESHOLD = 1000

const queuingStrategy = UnixFS.withCapacity()

const defaultSettings = UnixFS.configure({
  fileChunkEncoder: raw,
  smallFileEncoder: raw,
})

class UnixFSDirectoryBuilder {
  entries = new Map<string, UnixFSDirectoryBuilder | UnixFsFileBuilder>()

  async finalize(writer: View) {
    const dirWriter =
      this.entries.size <= SHARD_THRESHOLD
        ? UnixFS.createDirectoryWriter(writer)
        : /* c8 ignore next */
          UnixFS.createShardedDirectoryWriter(writer)
    for (const [name, entry] of this.entries) {
      const link = await entry.finalize(writer)
      dirWriter.set(name, link)
    }
    return dirWriter.close()
  }
}

class UnixFsFileBuilder {
  #file: BlobLike
  constructor(file: BlobLike) {
    this.#file = file
  }

  async finalize(writer: View) {
    const unixfsFileWriter = UnixFS.createFileWriter(writer)
    await this.#file.stream().pipeTo(
      new WritableStream({
        async write(chunk) {
          await unixfsFileWriter.write(chunk)
        },
      }),
    )
    return unixfsFileWriter.close()
  }
}

export function createDirectoryEncoderStream(
  files: Iterable<FileLike>,
  settings = defaultSettings,
): ReadableStream<UnixFS.Block> {
  const rootDir = new UnixFSDirectoryBuilder()

  for (const file of files) {
    const path = file.name.split('/')
    if (path[0] === '' || path[0] === '.') {
      path.shift()
    }
    let dir = rootDir
    for (const [i, name] of path.entries()) {
      if (i === path.length - 1) {
        dir.entries.set(name, new UnixFsFileBuilder(file))
        break
      }
      let dirBuilder = dir.entries.get(name)
      if (dirBuilder == null) {
        dirBuilder = new UnixFSDirectoryBuilder()
        dir.entries.set(name, dirBuilder)
      }
      if (!(dirBuilder instanceof UnixFSDirectoryBuilder)) {
        throw new Error(`"${name}" cannot be a file and a directory`)
      }
      dir = dirBuilder
    }
  }

  const { readable, writable } = new TransformStream<
    UnixFS.Block,
    UnixFS.Block
  >({}, queuingStrategy as QueuingStrategy<UnixFS.Block>)
  const unixfsWriter = UnixFS.createWriter({ writable, settings })
  ;(async () => {
    await rootDir.finalize(unixfsWriter)
    await unixfsWriter.close()
  })()

  return readable
}
