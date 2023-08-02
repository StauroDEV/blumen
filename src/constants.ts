import { uploadOnEstuary } from './providers/estuary.js'
import { uploadOnGW3 } from './providers/gw3.js'
import { uploadOnW3S } from './providers/w3s.js'
import type { UploadFunction } from './types.js'

export const PROVIDERS: Record<
  string,
  { name: string; upload: UploadFunction }
> = {
  ESTUARY_TOKEN: {
    name: 'Estuary',
    upload: uploadOnEstuary,
  },
  W3S_TOKEN: {
    name: 'web3.storage',
    upload: uploadOnW3S,
  },
  GW3_TOKEN: {
    name: 'Gateway3',
    upload: uploadOnGW3,
  },
}
