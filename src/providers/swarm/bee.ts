import { DeployError } from '../../errors.js'
import type { UploadFunction } from '../../types.js'
import { logger } from '../../utils/logger.js'
import { referenceToCID } from '../../utils/swarm.js'

const providerName = 'Bee'

export const uploadOnBee: UploadFunction<{ beeURL: string }> = async ({ token, car, verbose, beeURL }) => {
  const res = await fetch(`${beeURL}/bzz`, {
    body: car,
    headers: {
      'Swarm-Postage-Batch-Id': token,
      'Content-Type': 'application/x-tar',
      'Swarm-Index-Document': 'index.html',
      'Swarm-Error-Document': 'index.html',
      'Swarm-Collection': 'true',
    },
    method: 'POST',
  })

  const json = await res.json()

  if (verbose) logger.request('POST', res.url, res.status)

  if (!res.ok) {
    throw new DeployError(providerName, json.message)
  }

  return { cid: referenceToCID(`0x${json.reference}`).toString(), rID: json.reference }
}
