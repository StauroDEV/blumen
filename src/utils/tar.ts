import { createTar, type TarFileItem } from 'nanotar'
import type { FileEntry } from '../types.js'

export const packTAR = async (
  files: Omit<FileEntry, 'size'>[],
): Promise<Uint8Array> => {
  const entries: TarFileItem[] = []

  for (const { path, content } of files) {
    const chunks: Uint8Array[] = []
    let totalLength = 0

    for await (const chunk of content) {
      chunks.push(chunk)
      totalLength += chunk.length
    }

    const fileData = new Uint8Array(totalLength)
    let offset = 0
    for (const c of chunks) {
      fileData.set(c, offset)
      offset += c.length
    }

    entries.push({
      name: path,
      data: fileData,
    })
  }

  return createTar(entries)
}
