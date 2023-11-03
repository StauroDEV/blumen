import type { PinStatus, StatusFunction, UploadFunction } from '../types.js'
import { DeployError, PinningNotSupportedError } from '../errors.js'

const baseURL = 'https://api.web3.storage'
const providerName = 'web3.storage'

export const uploadOnW3S: UploadFunction = async ({
  token,
  car,
  cid,
  name
}) => {
  if (cid) throw new PinningNotSupportedError(providerName)

  const res = await fetch(new URL('/car', baseURL), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      ...(name ? { 'X-NAME': encodeURIComponent(name) } : {})
    },
    body: car as Blob
  })

  const json = await res.json()
  if (!res.ok) {
    throw new DeployError(
      providerName,
      (json as { message: string; code: string }).message,
    )
  }

  return json as { cid: string }
}

export const statusOnW3S: StatusFunction = async (cid) => {
  const res = await fetch(new URL(`/status/${cid}`, baseURL))
  const json = (await res.json()) as {
    pins: [{ status: string }]
    deals: { dealId: string; status: string }[]
  }

  return res.ok
    ? {
      pin: json.pins[0].status.toLowerCase() as PinStatus,
      deal: { id: json.deals }
    }
    : { pin: 'unknown' }
}
