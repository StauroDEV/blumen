import { ReadableStream } from 'node:stream/web'

export type FileEntry = {
  name: string
  size: number
  stream: () => ReadableStream
}

export type UploadArgs =
  | {
      car: Blob
      token: string
      accessKey?: string
      cid?: never
      name?: string
    }
  | {
      car?: never
      token: string
      accessKey?: string
      cid: string
      name: string
    }

export type UploadReturnType = {
  cid: string
  providers?: string[]
  status?: string
}

export type UploadFunction = (args: UploadArgs) => Promise<UploadReturnType>

export type Supported = 'upload' | 'pin'
