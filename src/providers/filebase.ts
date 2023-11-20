import { UploadNotSupportedError } from '../errors.js'
import { UploadFunction } from '../types.js'
import { specPin } from './spec.js'

const providerName = 'Filebase'
const baseURL = 'https://api.filebase.io/v1/ipfs/pins'

export const uploadOnFilebase: UploadFunction = async ({ cid, name, token, car }) => {
  if (car) throw new UploadNotSupportedError(providerName)

  return await specPin({ baseURL, providerName, cid, name, token })
}
