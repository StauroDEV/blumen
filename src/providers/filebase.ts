import { UploadNotSupportedError } from '../errors.js'
import { StatusFunction, UploadFunction } from '../types.js'
import { specPin, specStatus } from './spec.js'

const providerName = 'Filebase'
const baseURL = 'https://api.filebase.io/v1/ipfs'

export const uploadOnFilebase: UploadFunction = async args => specPin({ providerName, baseURL, ...args })

export const statusOnFilebase: StatusFunction = async ({ cid, auth }) => specStatus({ baseURL, cid, auth })
