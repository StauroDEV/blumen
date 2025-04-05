import { UploadNotSupportedError } from '../errors.js'
import { UploadFunction } from '../types.js'
// import { uploadOnS3 } from './s3.js'
import { specPin } from './spec.js'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const uploadOn4everland: UploadFunction<{ bucketName?: string }> = async ({ first, bucketName, ...args }) => {
  if (first) {
    throw new UploadNotSupportedError('4EVERLAND')
    // if (!bucketName) throw new MissingKeyError(`4EVERLAND_BUCKET_NAME`)
    // const res = await uploadOnS3({
    //   bucketName,
    //   apiUrl: 'https://endpoint.4everland.co',
    //   providerName: '4EVERLAND',
    //   ...args,
    // })

    // console.log(await res.json())

    // return { cid: res.headers.get('x-amz-meta-cid')!, status: 'queued' }
  }
  else {
    return specPin({ providerName: '4EVERLAND', baseURL: 'https://api.4everland.dev', first, ...args })
  }
}
