// import { uploadOnEstuary } from './providers/estuary.js'
import { uploadOnDolpin } from './providers/dolpin.js'
import { statusOnGW3, uploadOnGW3 } from './providers/gw3.js'
import { statusOnW3S, uploadOnW3S } from './providers/w3s.js'
import type { StatusFunction, UploadFunction } from './types.js'

export const PROVIDERS: Record<
string,
{ name: string, upload: UploadFunction, status?: StatusFunction }
> = {
  // ESTUARY_TOKEN: {
  //   name: 'Estuary',
  //   upload: uploadOnEstuary,
  // },
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
  DOLPIN_TOKEN: {
    name: 'Dolpin',
    upload: uploadOnDolpin,
  },
}
