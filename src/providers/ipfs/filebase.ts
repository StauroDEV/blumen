import { MissingKeyError } from '../../errors.js'
import type { StatusFunction, UploadFunction } from '../../types.js'
import { uploadOnS3 } from './s3.js'
import { specPin, specStatus } from './spec.js'

const providerName = 'Filebase'
const baseURL = 'https://rpc.filebase.io/api/v0'

export const uploadOnFilebase: UploadFunction<{ bucketName: string }> = async ({
  first,
  car,
  name,
  token,
  bucketName,
  verbose,
  cid,
}) => {
  if (first) {
    if (!bucketName) throw new MissingKeyError(`FILEBASE_BUCKET_NAME`)

    const res = await uploadOnS3({
      bucketName,
      apiUrl: 's3.filebase.com',
      providerName,
      verbose,
      name,
      car,
      token,
    })

    return { cid: res.headers.get('x-amz-meta-cid')!, status: 'queued' }
  }

  return specPin({ providerName, baseURL, first, name, token, cid, verbose, method: `/pin/add?arg=${cid}` })
}

export const statusOnFilebase: StatusFunction = async ({ cid, auth }) =>
  specStatus({ baseURL, cid, auth })
