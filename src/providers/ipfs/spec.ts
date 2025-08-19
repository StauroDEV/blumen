import { DeployError, UploadNotSupportedError } from '../../errors.js'
import type { PinFunction, StatusFunction } from '../../types.js'
import { logger } from '../../utils/logger.js'

type SpecPinFunction = PinFunction<{ baseURL: string; providerName: string }>

export const specPin: SpecPinFunction = async ({
  baseURL,
  providerName,
  cid,
  name,
  token,
  first,
  verbose,
}) => {
  if (first) throw new UploadNotSupportedError(providerName)

  const res = await fetch(new URL(`${baseURL}/pins`), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      cid,
      name,
    }),
  })

  if (verbose) logger.request('POST', res.url, res.status)

  const json = await res.json()

  if (!res.ok) throw new DeployError(providerName, json.error.details)

  return { status: json.status, cid: json.pin.cid }
}

export const specStatus: StatusFunction<{ baseURL: string }> = async ({
  cid,
  baseURL,
  auth,
  verbose,
}) => {
  const res = await fetch(`${baseURL}/pins?cid=${cid}&limit=1`, {
    headers: {
      Authorization: `Bearer ${auth.token}`,
    },
  })

  if (verbose) logger.request('GET', res.url, res.status)

  const json = await res.json()

  if (res.status === 404 || json.count === 0) return { pin: 'not pinned' }
  else if (!res.ok) throw new Error(json.error.details)

  return {
    pin: json.results[0].status,
  }
}
