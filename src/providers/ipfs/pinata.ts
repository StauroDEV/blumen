import type { PinFunction, StatusFunction } from '../../types.js'
import { specPin, specStatus } from './spec.js'

export const pinOnPinata: PinFunction = (args) => {
  return specPin({
    ...args,
    providerName: 'Pinata',
    baseURL: 'https://api.pinata.cloud/psa',
  })
}

export const statusOnPinata: StatusFunction = (args) => {
  return specStatus({ ...args, baseURL: 'https://api.pinata.cloud/psa' })
}
