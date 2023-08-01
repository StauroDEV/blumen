import type { UploadFunction } from '../types.js'
import { DeployError, PinningNotSupportedError } from '../errors.js'
import { fetch } from 'undici'

const baseURL = `https://api.web3.storage`
const providerName = 'web3.storage'

export const uploadOnW3S: UploadFunction = async ({ token, car, cid }) => {
  if (cid) throw new PinningNotSupportedError(providerName)

  const res = await fetch(new URL(`/car`, baseURL), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: car,
  })

  const json = await res.json()
  if (!res.ok) {
    throw new DeployError(
      providerName,
      (json as { error: { details: string } }).error.details
    )
  }

  return json as { cid: string }
}
