import { DeployError, UploadNotSupportedError } from '../errors.js'
import { UploadFunction } from '../types.js'

export const specPin: UploadFunction<{ baseURL: string, providerName: string }> = async ({ baseURL, providerName, cid, name, token, car }) => {
  if (car) throw new UploadNotSupportedError(providerName)

  const res = await fetch(new URL('pins', baseURL), {
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
