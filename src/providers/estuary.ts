import type { UploadFunction } from '../types.js'
import { DeployError, GatewayError } from '../errors.js'

const baseURL = 'https://api.estuary.tech'
const providerName = 'Estuary'

export const uploadOnEstuary: UploadFunction = async ({
  token,
  car,
  cid,
  name,
}) => {
  const res = await fetch(
    new URL(
      cid ? '/pinning/pins' : `/content/add-car?filename=${name}`,
      baseURL,
    ),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: cid ? JSON.stringify({ cid, name }) : car as Blob,
    },
  )

  if ([502, 504].includes(res.status))
    throw new GatewayError(providerName, res.status, res.statusText)

  const json = (await res.json()) as {
    error: { details: string }
    cid: string
    providers: string[]
    pin: { cid: string }
    status: 'queued'
  }

  if (!res.ok) {
    throw new DeployError(providerName, json.error.details)
  }

  return car
    ? { cid: json.cid, providers: json.providers }
    : { cid: json.pin.cid, status: json.status }
}
