import type { UploadFunction } from '../types.js'
import {
  DeployError,
  MissingKeyError,
  UploadNotSupportedError,
} from '../errors.js'
import { fetch } from 'undici'

const getTs = () => Math.floor(Date.now() / 1000).toString()

const baseURL = `https://gw3.io`
const providerName = 'Gateway3'

export const uploadOnGW3: UploadFunction = async ({
  token,
  car,
  cid,
  accessKey,
}) => {
  if (car) throw new UploadNotSupportedError(providerName)
  if (!accessKey) throw new MissingKeyError(`GW3_ACCESS_KEY`)

  const res = await fetch(
    new URL(`/api/v0/pin/add?arg=${cid}&ts=${getTs()}`, baseURL),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Access-Key': accessKey,
        'X-Access-Secret': token,
      },
      body: car,
    }
  )

  if (!res.ok) {
    const json = await res.text()
    throw new DeployError(
      providerName,
      (JSON.parse(json) as { msg: string }).msg
    )
  }

  return { cid }
}
