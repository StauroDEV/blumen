import { statusOnFilebase, uploadOnFilebase } from './providers/filebase.js'
import { statusOnGW3, uploadOnGW3 } from './providers/gw3.js'
import { uploadOnLighthouse } from './providers/lighthouse.js'
import { statusOnW3S, uploadOnW3S } from './providers/w3s.js'
import type { StatusFunction, UploadFunction } from './types.js'

export const PROVIDERS: Record<
string,
{ name: string, upload: UploadFunction, status?: StatusFunction }
> = {
  W3S_TOKEN: {
    name: 'web3.storage',
    upload: uploadOnW3S,
    status: statusOnW3S,
  },
  GW3_TOKEN: {
    name: 'Gateway3',
    upload: uploadOnGW3,
    status: statusOnGW3,
  },
  FILEBASE_TOKEN: {
    name: 'Filebase',
    upload: uploadOnFilebase,
    status: statusOnFilebase,
  },
  LIGHTHOUSE_TOKEN: {
    name: 'Lighthouse',
    upload: uploadOnLighthouse,
  },
}
