import { tmpdir } from 'node:os'
import { readFile, open } from 'node:fs/promises'
import { Writable } from 'node:stream'
import { createWriteStream } from 'node:fs'
import { CID } from 'multiformats/cid'
import { CarWriter } from '@ipld/car/writer'
import type { FileEntry } from '../types.js'
import { Blob } from 'node:buffer'
import { TransformStream } from 'node:stream/web'
import {
  createDirectoryEncoderStream,
  CAREncoderStream,
} from '../ipfs-car/index.js'
import { Block } from '@ipld/unixfs'
import { writableToWeb } from '../polyfills/toWeb.js'

const tmp = tmpdir()

export const packCAR = async (files: FileEntry[], name: string) => {
  const output = `${tmp}/${name}.car`

  const placeholderCID = CID.parse(
    'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
  )
  let rootCID = placeholderCID

  await createDirectoryEncoderStream(files)
    .pipeThrough(
      new TransformStream<Block>({
        transform(block, controller) {
          rootCID = block.cid as CID
          controller.enqueue(block)
        },
      }),
    )
    .pipeThrough(new CAREncoderStream([placeholderCID]))
    .pipeTo(writableToWeb(createWriteStream(output)))

  const fd = await open(output, 'r+')
  await CarWriter.updateRootsInFile(fd, [rootCID!])
  await fd.close()

  const file = await readFile(output)
  const blob = new Blob([file], { type: 'application/vnd.ipld.car' })
  return { blob, rootCID }
}
