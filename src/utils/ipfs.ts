import { createWriteStream } from 'node:fs'
import { open, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { CarWriter } from '@ipld/car/writer'
import { MemoryBlockstore } from 'blockstore-core/memory'
import { type FileCandidate, importer } from 'ipfs-unixfs-importer'
import { CID } from 'multiformats/cid'
import { InvalidCIDError } from '../errors.js'
import { encodeCARBlock, encodeCARHeader } from './car.js'

const tmp = tmpdir()

const placeholderCID = CID.parse(
  'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
)

const blockstore = new MemoryBlockstore()

export const packCAR = async (
  files: FileCandidate[],
  name: string,
  dir = tmp,
): Promise<{ blob: Blob; rootCID: CID }> => {
  const output = `${dir}/${name}.car`

  const writeStream = createWriteStream(output)

  let rootCID = placeholderCID
  let headerWritten = false

  for await (const entry of importer(files, blockstore, {
    wrapWithDirectory: true,
  })) {
    rootCID = entry.cid

    if (!headerWritten) {
      const headerBytes = encodeCARHeader([entry.cid])
      writeStream.write(headerBytes)
      headerWritten = true
      continue
    }
    const bytes = await blockstore.get(entry.cid)
    const blockBytes = encodeCARBlock({ cid: entry.cid, bytes })
    writeStream.write(blockBytes)
  }
  writeStream.close()

  const fd = await open(output, 'r+')
  await CarWriter.updateRootsInFile(fd, [rootCID])
  await fd.close()

  // return blob
  const file = await readFile(output)
  const blob = new Blob([file as BlobPart], {
    type: 'application/vnd.ipld.car',
  })

  return { blob, rootCID }
}

export const assertCID = (cid: string) => {
  if (cid.length !== 64) {
    try {
      CID.parse(cid)
    } catch {
      throw new InvalidCIDError(cid)
    }
  }
}
