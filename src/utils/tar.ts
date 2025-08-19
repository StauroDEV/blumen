import { createTar, type TarFileItem } from 'nanotar'
import type { FileEntry } from '../types.js'

async function readableStreamToUint8Array(
  stream: ReadableStream,
): Promise<Uint8Array> {
  const reader = stream.getReader()
  const chunks: ArrayLike<number>[] = []
  let totalLength = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    totalLength += value.length
  }

  const result = new Uint8Array(totalLength)
  let offset = 0
  for (const chunk of chunks) {
    result.set(chunk, offset)
    offset += chunk.length
  }

  return result
}

export const packTAR = async (
  files: Omit<FileEntry, 'size'>[],
): Promise<Uint8Array> => {
  const entries: TarFileItem[] = []

  for (const { name, stream } of files) {
    entries.push({
      name,
      data: await readableStreamToUint8Array(stream()),
    })
  }

  return createTar(entries)
}
