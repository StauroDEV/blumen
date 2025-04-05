import { statusOn4everland, uploadOn4everland } from './providers/4everland.js'
import { statusOnFilebase, uploadOnFilebase } from './providers/filebase.js'
import { pinOnPinata, statusOnPinata } from './providers/pinata.js'
import { uploadOnWStoracha } from './providers/storacha.js'
import type { StatusFunction, SupportedMethods, UploadFunction } from './types.js'

export const PROVIDERS: Record<
  string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { name: string, upload: UploadFunction<any>, status?: StatusFunction<any>, supported: SupportedMethods }
> = {
  'STORACHA_TOKEN': {
    name: 'Storacha',
    upload: uploadOnWStoracha,
    supported: 'upload',
  },
  'FILEBASE_TOKEN': {
    name: 'Filebase',
    upload: uploadOnFilebase,
    status: statusOnFilebase,
    supported: 'both',
  },
  '4EVERLAND_TOKEN': {
    name: '4EVERLAND',
    upload: uploadOn4everland,
    status: statusOn4everland,
    supported: 'pin',
  },
  'PINATA_TOKEN': {
    name: 'Pinata',
    upload: pinOnPinata,
    status: statusOnPinata,
    supported: 'pin',
  },
}

export const isTTY = process.stdout.isTTY

export const CLOUDFLARE_API_URL = 'https://api.cloudflare.com/client/v4'
