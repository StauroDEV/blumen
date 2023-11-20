import { DeployError, UploadNotSupportedError } from '../errors.js'
import { StatusFunction, UploadFunction } from '../types.js'

export const specPin: UploadFunction<{ baseURL: string, providerName: string }> = async ({ baseURL, providerName, cid, name, token, car }) => {
  if (car) throw new UploadNotSupportedError(providerName)

  const res = await fetch(new URL(`${baseURL}/pins`), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    }, body: JSON.stringify({
      cid, name,
    }),
  })

  const json = await res.json()

  if (!res.ok) throw new DeployError(providerName, json.error.details)

  return { status: json.status, cid: json.pin.cid }
}

export const specStatus: StatusFunction<{ baseURL: string }> = async ({ cid, baseURL, auth }) => {
  const res = await fetch(`${baseURL}/pins?cid=${cid}&limit=1`, {
    headers: {
      Authorization: `Bearer ${auth!.token}`,
    },
  })

  const json = await res.json()

  if (res.status === 404) return { pin: 'not pinned' }
  else if (!res.ok) throw new Error(json.error.details)

  return {
    pin: json.results[0].status,
  }
}
