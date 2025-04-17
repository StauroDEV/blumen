import { statusOn4everland, uploadOn4everland } from './providers/4everland.js'
import { statusOnFilebase, uploadOnFilebase } from './providers/filebase.js'
import { pinOnLighthouse } from './providers/lighthouse.js'
import { pinOnPinata, statusOnPinata } from './providers/pinata.js'
import { pinOnQuicknode } from './providers/quicknode.js'
import { specPin, specStatus } from './providers/spec.js'
import { uploadOnWStoracha } from './providers/storacha.js'
import { uploadOnSwarmy } from './providers/swarmy.js'
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
  'SPEC_TOKEN': {
    name: 'Spec',
    upload: ({ baseURL, ...args }) => specPin({ ...args, providerName: 'Spec-compliant Pinning Service', baseURL }),
    status: ({ baseURL, ...args }) => specStatus({ ...args, baseURL }),
    supported: 'pin',
  },
  'QUICKNODE_TOKEN': {
    name: 'QuickNode',
    upload: pinOnQuicknode,
    supported: 'pin',
  },
  'LIGHTHOUSE_TOKEN': {
    name: 'Lighthouse',
    upload: pinOnLighthouse,
    supported: 'pin',
  },
  'SWARMY_TOKEN': {
    name: 'Swarmy',
    upload: uploadOnSwarmy,
    supported: 'upload',
  },
}

export const isTTY = process.stdout.isTTY

export const CLOUDFLARE_API_URL = 'https://api.cloudflare.com/client/v4'
