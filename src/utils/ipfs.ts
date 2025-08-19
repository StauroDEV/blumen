import { createWriteStream } from 'node:fs'
import { open, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { Writable } from 'node:stream'
import type { Block } from '@ipld/car/reader'
import { CarWriter } from '@ipld/car/writer'
import { CID } from 'multiformats/cid'
import { InvalidCIDError } from '../errors.js'
import type { FileEntry } from '../types.js'
import { CAREncoderStream } from './car.js'
import { createDirectoryEncoderStream } from './storacha/directory-encoder.js'

const tmp = tmpdir()

const placeholderCID = CID.parse(
  'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
)

export const packCAR = async (files: FileEntry[], name: string, dir = tmp) => {
  const output = `${dir}/${name}.car`

  let rootCID = placeholderCID

  await createDirectoryEncoderStream(files)
    .pipeThrough(
      new TransformStream({
        transform(block: Block, controller) {
          rootCID = block.cid
          controller.enqueue(block)
        },
      }),
    )
    .pipeThrough(new CAREncoderStream([placeholderCID]))
    .pipeTo(Writable.toWeb(createWriteStream(output)))

  const fd = await open(output, 'r+')
  await CarWriter.updateRootsInFile(fd, [rootCID])
  await fd.close()

  const file = await readFile(output) as BufferSource
  const blob = new Blob([file], { type: 'application/vnd.ipld.car' })
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
