import { StatusFunction, UploadFunction } from '../types.js'
import { specPin, specStatus } from './spec.js'

export const pinOnPinata: UploadFunction = (args) => {
  return specPin({ providerName: 'Pinata', baseURL: 'https://api.pinata.cloud/psa', ...args })
}

export const statusOnPinata: StatusFunction = (args) => {
  return specStatus({ baseURL: 'https://api.pinata.cloud/psa', ...args })
}
