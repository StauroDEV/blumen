import { uploadOnEstuary } from './providers/estuary.js'
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
}
