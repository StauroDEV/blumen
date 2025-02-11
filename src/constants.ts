import { statusOnFilebase, uploadOnFilebase } from './providers/filebase.js'
import { uploadOnWStoracha } from './providers/storacha.js'
import type { StatusFunction, SupportedMethods, UploadFunction } from './types.js'

export const PROVIDERS: Record<
  string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { name: string, upload: UploadFunction<any>, status?: StatusFunction, supported: SupportedMethods }
> = {
  W3S_TOKEN: {
    name: 'Storacha',
    upload: uploadOnWStoracha,
    supported: 'upload',
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
