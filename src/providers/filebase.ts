import { uploadCar } from '@stauro/filebase-upload'
import { StatusFunction, UploadFunction } from '../types.js'
import { specPin, specStatus } from './spec.js'
import { DeployError, MissingKeyError } from '../errors.js'
import { logger } from '../utils/logger.js'

const providerName = 'Filebase'
const baseURL = 'https://api.filebase.io/v1/ipfs'

export const uploadOnFilebase: UploadFunction<{ bucketName: string }>
  = async ({ first, car, name, token, bucketName, verbose, ...args }) => {
    if (first) {
      if (!bucketName) throw new MissingKeyError(`FILEBASE_BUCKET_NAME`)

      const file = new File([car], name)

      const res = await uploadCar({ apiUrl: 's3.filebase.com', file, token, bucketName })

      const text = await res.text()

      if (!res.ok) throw new DeployError(providerName, text)

      if (verbose) logger.request('PUT', res.url, res.status, text)

      return { cid: res.headers.get('x-amz-meta-cid')!, status: 'queued' }
    }

    return specPin({ providerName, baseURL, first, car, name, token, ...args })
  }

export const statusOnFilebase: StatusFunction = async ({ cid, auth }) => specStatus({ baseURL, cid, auth })
