import { DeployError } from '../errors.js'
import type { UploadFunction } from '../types.js'
import { logger } from '../utils/logger.js'
import { referenceToCID } from '../utils/swarm.js'

const providerName = 'Swarmy'

export const uploadOnSwarmy: UploadFunction = async ({ token, car, verbose }) => {
  const body = new FormData()
  body.append('file', new Blob([car], { type: 'application/x-tar' }))
  const res = await fetch('https://api.swarmy.cloud/api/files?website=true', {
    body,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method: 'POST',
  })

  const json = await res.json()

  if (verbose) logger.request('POST', res.url, res.status)

  if (!res.ok) {
    throw new DeployError(providerName, json.message)
  }

  return { cid: referenceToCID(`0x${json.swarmReference}`), rID: json.swarmReference }
}
