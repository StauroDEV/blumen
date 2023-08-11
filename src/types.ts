import { ReadableStream } from 'node:stream/web'

export type FileEntry = {
  name: string
  size: number
  stream: () => ReadableStream
}

type AuthArgs = {
  token: string
  accessKey?: string
}

export type UploadArgs = (
  | {
      car: Blob
      cid?: never
      name?: string
    }
  | {
      car?: never
      cid: string
      name: string
    }
) &
  AuthArgs

export type UploadReturnType = {
  cid: string
  providers?: string[]
  status?: string
}

export type UploadFunction = (args: UploadArgs) => Promise<UploadReturnType>

export type Supported = 'upload' | 'pin'

export type PinStatus = 'queued' | 'pinned' | 'failed' | 'unpinning' | 'unknown'

export type FilecoinDeal = { status: string; dealId: string }

export type StatusFunction = (
  cid: string,
  auth?: Partial<AuthArgs>
) => Promise<{
  pin: PinStatus
  deals?: FilecoinDeal[]
}>
