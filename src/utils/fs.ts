import { access, stat } from 'node:fs/promises'
import { constants } from 'node:fs'
import { FileEntry } from '../types.js'
import { createReadStream } from 'node:fs'
import { glob } from 'tinyglobby'
import { Readable } from 'node:stream'
import { logger } from './logger.js'
import { relative } from 'node:path'

export const walk = async (dir: string, verbose = false) => {
  let total = 0
  const files: FileEntry[] = []
  for (const path of await glob(dir, { ignore: ['**/node_modules'], onlyFiles: true, absolute: false })) {
    const size = (await stat(path)).size
    const name = relative(dir, path)
    if (verbose) logger.text(`${name} (${fileSize(size, 2)})`)
    total += size
    files.push({
      name,
      size,
      stream: () => Readable.toWeb(createReadStream(path)) as ReadableStream,
    })
  }

  return [total, files] as const
}

export const exists = async (file: string) => {
  try {
    await access(file, constants.F_OK)
    return true
  }
  catch {
    return false
  }
}

export function fileSize(bytes: number, digits = 1): string {
  const thresh = 1000

  if (Math.abs(bytes) < thresh) return bytes + 'B'

  const units = ['KB', 'MB', 'GB', 'TB', 'PB']
  let u = -1
  const r = 10 ** digits

  do {
    bytes /= thresh
    ++u
  } while (
    Math.round(Math.abs(bytes) * r) / r >= thresh
    && u < units.length - 1
  )

  return bytes.toFixed(digits) + units[u]
}
