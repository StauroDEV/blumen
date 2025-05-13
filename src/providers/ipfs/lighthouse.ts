import { DeployError, UploadNotSupportedError } from '../../errors.js'
import type { UploadFunction } from '../../types.js'
import { logger } from '../../utils/logger.js'

const providerName = 'Lighthouse'

export const pinOnLighthouse: UploadFunction = async ({
  first,
  token,
  verbose,
  cid,
}) => {
  if (first) throw new UploadNotSupportedError(providerName)

  const res = await fetch('https://api.lighthouse.storage/api/lighthouse/pin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ cid }),
  })

  if (verbose) logger.request('POST', res.url, res.status)

  const json = await res.json()

  if (!res.ok) throw new DeployError(providerName, json.error.message)

  return { cid, status: 'queued' }
}
