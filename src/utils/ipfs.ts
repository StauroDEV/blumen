import { createWriteStream } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { CarWriter } from '@ipld/car/writer'
import { MemoryBlockstore } from 'blockstore-core/memory'
import { type FileCandidate, importer } from 'ipfs-unixfs-importer'
import { CID } from 'multiformats/cid'
import { InvalidCIDError } from '../errors.js'

const tmp = tmpdir()

export const packCAR = async (
  files: FileCandidate[],
  name: string,
  dir = tmp,
): Promise<{ blob: Blob; rootCID: CID }> => {
  const output = `${dir}/${name}.car`

  const blockstore = new MemoryBlockstore()
  let rootCID: CID | null = null

  for await (const entry of importer(files, blockstore, {
    wrapWithDirectory: true,
  })) {
    rootCID = entry.cid
  }

  if (!rootCID) {
    throw new Error('No files were imported')
  }

  const writeStream = createWriteStream(output)
  const { writer, out } = CarWriter.create([rootCID])

  const writePromise = (async () => {
    for await (const chunk of out) {
      writeStream.write(chunk)
    }
  })()

  for await (const { cid } of blockstore.getAll()) {
    try {
      const bytes = await blockstore.get(cid)
      await writer.put({ cid, bytes })
    } catch (error) {
      console.warn(`Failed to add block ${cid.toString()} to CAR:`, error)
    }
  }

  await writer.close()
  await writePromise
  writeStream.end()

  await new Promise<void>((resolve) => writeStream.on('close', resolve))

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
