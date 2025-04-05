import { StatusFunction, UploadFunction } from '../types.js'
import { specPin, specStatus } from './spec.js'
import { MissingKeyError } from '../errors.js'
import { uploadOnS3 } from './s3.js'

const providerName = 'Filebase'
const baseURL = 'https://api.filebase.io/v1/ipfs'

export const uploadOnFilebase: UploadFunction<{ bucketName: string }>
  = async ({ first, car, name, token, bucketName, verbose, ...args }) => {
    if (first) {
      if (!bucketName) throw new MissingKeyError(`FILEBASE_BUCKET_NAME`)

      const res = await uploadOnS3({
        bucketName, apiUrl: 's3.filebase.com', providerName, verbose, name, car, token, ...args,
      })

      return { cid: res.headers.get('x-amz-meta-cid')!, status: 'queued' }
    }

    return specPin({ providerName, baseURL, first, car, name, token, ...args })
  }

export const statusOnFilebase: StatusFunction = async ({ cid, auth }) => specStatus({ baseURL, cid, auth })
