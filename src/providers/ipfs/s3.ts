import { uploadCar } from '@stauro/filebase-upload'
import { DeployError } from '../../errors.js'
import type { UploadArgs } from '../../types.js'
import { logger } from '../../utils/logger.js'

export const uploadOnS3 = async ({
  name, car, token, bucketName, apiUrl,
  providerName, verbose,
}: Omit<UploadArgs<{
  providerName: string
  bucketName: string
  apiUrl: string
}>, 'first'>): Promise<Response> => {
  const file = new File([car], name)

  const res = await uploadCar({ apiUrl, file, token, bucketName })

  const text = await res.text()

  if (!res.ok) throw new DeployError(providerName, text)

  if (verbose) logger.request('PUT', res.url, res.status)

  return res
}
