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
}

export type UploadArgs<T = object> = {
  name: string
  verbose?: boolean
  car: Blob
} & ({ cid?: never; first: true } | { cid: string; first: false }) &
  AuthArgs &
  T

export type PinArgs<T = object> = {
  cid: string
  name: string
  verbose?: boolean
  first?: boolean
} & AuthArgs &
  T

type UploadReturnType = {
  cid: string
  providers?: string[]
  status?: PinStatus
  rID?: string
}

export type PinFunction<T = Record<string, unknown>> = (
  args: PinArgs<T>,
) => Promise<UploadReturnType>

export type UploadFunction<T = Record<string, unknown>> = (
  args: UploadArgs<T>,
) => Promise<UploadReturnType>

export type PinStatus =
  | 'queued'
  | 'pinned'
  | 'failed'
  | 'unpinning'
  | 'unknown'
  | 'not pinned'

type StatusArgs<T> = {
  cid: string
  auth: Partial<AuthArgs>
  verbose?: boolean
} & T

export type StatusFunction<T = object> = (args: StatusArgs<T>) => Promise<{
  pin: PinStatus
}>

export type ChainName = 'mainnet' | 'sepolia'

export type SupportedMethods = 'pin' | 'upload' | 'both'
