import { statusOnFilebase, uploadOnFilebase } from './providers/filebase.js'
import { statusOnGW3, uploadOnGW3 } from './providers/gw3.js'
import { uploadOnW3S } from './providers/w3s.js'
import type { StatusFunction, SupportedMethods, UploadFunction } from './types.js'

export const PROVIDERS: Record<
string,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
{ name: string, upload: UploadFunction<any>, status?: StatusFunction, supported: SupportedMethods }
> = {
  W3S_TOKEN: {
    name: 'web3.storage',
    upload: uploadOnW3S,
    supported: 'upload',
  },
  GW3_TOKEN: {
    name: 'Gateway3',
    upload: uploadOnGW3,
    status: statusOnGW3,
    supported: 'both',
  },
  FILEBASE_TOKEN: {
    name: 'Filebase',
    upload: uploadOnFilebase,
    status: statusOnFilebase,
    supported: 'both',
  },
}

export const isTTY = process.stdout.isTTY

export const CLOUDFLARE_API_URL = 'https://api.cloudflare.com/client/v4'
