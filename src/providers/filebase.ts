import { UploadNotSupportedError } from '../errors.js'
import { StatusFunction, UploadFunction } from '../types.js'
import { specPin, specStatus } from './spec.js'

const providerName = 'Filebase'
const baseURL = 'https://api.filebase.io/v1/ipfs'

export const uploadOnFilebase: UploadFunction = async ({ cid, name, token, car }) => {
  if (car) throw new UploadNotSupportedError(providerName)

  return await specPin({ baseURL, providerName, cid, name, token })
}

export const statusOnFilebase: StatusFunction = async ({ cid, auth }) => specStatus({ baseURL, cid, auth })
