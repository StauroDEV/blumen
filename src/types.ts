import { ReadableStream } from 'node:stream/web'
import { Blob } from 'node:buffer'

export interface BlobLike {
  /**
   * Returns a ReadableStream which yields the Blob data.
   */
  stream: () => ReadableStream
}

export interface FileLike extends BlobLike {
  /**
   * Name of the file. May include path information.
   */
  name: string
}

export interface FileEntry extends FileLike {
  size: number
}

type AuthArgs = {
  token: string
  accessKey?: string
}

export type UploadArgs<T> = (
  {
    cid: string
    name: string
  } &
   ({
     car: Blob
   }
  | {
    car?: never
  })
) &
AuthArgs & T

export type UploadReturnType = {
  cid: string
  providers?: string[]
  status?: PinStatus
}

export type UploadFunction<T= {}> = (args: UploadArgs<T>) => Promise<UploadReturnType>

export type Supported = 'upload' | 'pin'

export type PinStatus = 'queued' | 'pinned' | 'failed' | 'unpinning' | 'unknown'

export type FilecoinDeal = { status: string, dealId: string }

export type StatusFunction = (
  cid: string,
  auth?: Partial<AuthArgs>,
) => Promise<{
  pin: PinStatus
  deals?: FilecoinDeal[]
}>

export type ChainName = 'mainnet' | 'goerli'
