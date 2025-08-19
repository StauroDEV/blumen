/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  statusOn4everland,
  uploadOn4everland,
} from './providers/ipfs/4everland.js'
import {
  statusOnFilebase,
  uploadOnFilebase,
} from './providers/ipfs/filebase.js'
import { pinOnLighthouse } from './providers/ipfs/lighthouse.js'
import { pinOnPinata, statusOnPinata } from './providers/ipfs/pinata.js'
import { pinOnQuicknode } from './providers/ipfs/quicknode.js'
import { specPin, specStatus } from './providers/ipfs/spec.js'
import { uploadOnStoracha } from './providers/ipfs/storacha.js'
import { uploadOnBee } from './providers/swarm/bee.js'
import { uploadOnSwarmy } from './providers/swarm/swarmy.js'
import type {
  StatusFunction,
  SupportedMethods,
  UploadFunction,
} from './types.js'

export const PROVIDERS: Record<
  string,
  {
    name: string
    upload: UploadFunction<any>
    status?: StatusFunction<any>
    supported: SupportedMethods
    protocol: 'ipfs' | 'swarm'
  }
> = {
  STORACHA_TOKEN: {
    name: 'Storacha',
    upload: uploadOnStoracha,
    supported: 'upload',
    protocol: 'ipfs',
  },
  FILEBASE_TOKEN: {
    name: 'Filebase',
    upload: uploadOnFilebase,
    status: statusOnFilebase,
    supported: 'both',
    protocol: 'ipfs',
  },
  '4EVERLAND_TOKEN': {
    name: '4EVERLAND',
    upload: uploadOn4everland,
    status: statusOn4everland,
    supported: 'pin',
    protocol: 'ipfs',
  },
  PINATA_TOKEN: {
    name: 'Pinata',
    upload: pinOnPinata,
    status: statusOnPinata,
    supported: 'pin',
    protocol: 'ipfs',
  },
  SPEC_TOKEN: {
    name: 'Spec',
    upload: ({ baseURL, ...args }) =>
      specPin({
        ...args,
        providerName: 'Spec-compliant Pinning Service',
        baseURL,
      }),
    status: ({ baseURL, ...args }) => specStatus({ ...args, baseURL }),
    supported: 'pin',
    protocol: 'ipfs',
  },
  QUICKNODE_TOKEN: {
    name: 'QuickNode',
    upload: pinOnQuicknode,
    supported: 'pin',
    protocol: 'ipfs',
  },
  LIGHTHOUSE_TOKEN: {
    name: 'Lighthouse',
    upload: pinOnLighthouse,
    supported: 'pin',
    protocol: 'ipfs',
  },
  SWARMY_TOKEN: {
    name: 'Swarmy',
    upload: uploadOnSwarmy,
    supported: 'upload',
    protocol: 'swarm',
  },
  BEE_TOKEN: {
    name: 'Bee',
    upload: uploadOnBee,
    supported: 'upload',
    protocol: 'swarm',
  },
}

export const isTTY = process.stdout.isTTY

export const CLOUDFLARE_API_URL = 'https://api.cloudflare.com/client/v4'

export const chains = {
  mainnet: {
    id: 1,
    name: 'Ethereum',
    blockExplorers: {
      default: {
        name: 'Etherscan',
        url: 'https://etherscan.io',
      },
    },
  },
  sepolia: {
    id: 11_155_111,
    name: 'Sepolia',
    blockExplorers: {
      default: {
        name: 'Etherscan',
        url: 'https://sepolia.etherscan.io',
      },
    },
  },
} as const
