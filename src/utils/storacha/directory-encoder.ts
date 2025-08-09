import type { Block, View } from '@ipld/unixfs'
import * as UnixFS from '@ipld/unixfs'
import { withMaxChunkSize } from '@ipld/unixfs/file/chunker/fixed'
import { withWidth } from '@ipld/unixfs/file/layout/balanced'
import * as raw from 'multiformats/codecs/raw'
import type { BlobLike, FileLike } from '../../types.js'

const SHARD_THRESHOLD = 1000
const queuingStrategy = UnixFS.withCapacity()
const defaultSettings = UnixFS.configure({
  fileChunkEncoder: raw,
  smallFileEncoder: raw,
  chunker: withMaxChunkSize(1024 * 1024),
  fileLayout: withWidth(1024),
})

class UnixFSFileBuilder {
  #file
  name: string
  constructor(name: string, file: BlobLike) {
    this.name = name
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
    return await unixfsFileWriter.close()
  }
}
class UnixFSDirectoryBuilder {
  entries = new Map<string, UnixFSFileBuilder | UnixFSDirectoryBuilder>()
  name: string
  constructor(name: string) {
    this.name = name
  }
  async finalize(writer: View) {
    const dirWriter =
      this.entries.size <= SHARD_THRESHOLD
        ? UnixFS.createDirectoryWriter(writer)
        : UnixFS.createShardedDirectoryWriter(writer)
    for (const [name, entry] of this.entries) {
      const link = await entry.finalize(writer)
      dirWriter.set(name, link)
    }
    return await dirWriter.close()
  }
}

export function createDirectoryEncoderStream(
  files: Iterable<FileLike>,
): ReadableStream<Block> {
  const rootDir = new UnixFSDirectoryBuilder('')
  for (const file of files) {
    const path = file.name.split('/')
    if (path[0] === '' || path[0] === '.') {
      path.shift()
    }
    let dir = rootDir
    for (const [i, name] of path.entries()) {
      if (i === path.length - 1) {
        dir.entries.set(name, new UnixFSFileBuilder(path.join('/'), file))
        break
      }
      let dirBuilder = dir.entries.get(name)
      if (dirBuilder == null) {
        const dirName = dir === rootDir ? name : `${dir.name}/${name}`
        dirBuilder = new UnixFSDirectoryBuilder(dirName)
        dir.entries.set(name, dirBuilder)
      }
      if (!(dirBuilder instanceof UnixFSDirectoryBuilder)) {
        throw new Error(`"${file.name}" cannot be a file and a directory`)
      }
      dir = dirBuilder
    }
  }
  const { readable, writable } = new TransformStream({}, queuingStrategy)
  const settings = defaultSettings
  const unixfsWriter = UnixFS.createWriter({ writable, settings })
  void (async () => {
    await rootDir.finalize(unixfsWriter)
    await unixfsWriter.close()
  })()
  return readable
}
