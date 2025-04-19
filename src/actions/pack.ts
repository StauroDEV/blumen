import path from 'path'
import { isTTY } from '../constants.js'
import { MissingDirectoryError } from '../errors.js'
import { fileSize, exists, walk } from '../utils/fs.js'
import { packCAR } from '../utils/ipfs.js'
import { logger } from '../utils/logger.js'
import colors from 'picocolors'
import { packTAR } from '../utils/tar.js'

export type PackActionArgs = Partial<{
  name: string
  dist: string
  verbose: boolean
  tar: boolean
}>

export const packAction = async (
  { dir, options = {} }:
  {
    dir?: string
    options?: PackActionArgs
  }) => {
  const { name: customName, dist, verbose, tar } = options
  if (!dir) {
    if (await exists('dist')) dir = 'dist'
    else dir = '.'
  }
  const normalizedPath = path.join(process.cwd(), dir)
  const name = customName || path.basename(normalizedPath)
  const [size, files] = await walk(normalizedPath, verbose)

  if (size === 0) throw new MissingDirectoryError(dir)
  const distName = ['.', 'dist'].includes(dir) ? name : dir

  logger.start(`Packing ${isTTY ? colors.cyan(distName) : distName} (${fileSize(size, 2)})`)

  if (tar) {
    const tar = await packTAR(files)
    const blob = new Blob([tar])
    return { blob }
  }
  else {
    const { rootCID, blob } = await packCAR(files, name, dist)

    const cid = rootCID.toString()
    logger.info(`Root CID: ${isTTY ? colors.white(cid) : cid}`)

    return { name, cid, blob, files }
  }
}
