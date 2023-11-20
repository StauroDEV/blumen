import type { PinStatus, StatusFunction, UploadFunction } from '../types.js'
import {
  DeployError,
  MissingKeyError,
} from '../errors.js'
import { CID } from 'multiformats'
import { logger } from '../utils/logger.js'

type GW3PinStatus = 'pinned' | 'unpinning' | 'failure' | 'pinning'

const getTs = () => Math.floor(Date.now() / 1000).toString()

const mapGw3StatusToGenericStatus = (status: GW3PinStatus): PinStatus => {
  switch (status) {
    case 'failure':
      return 'failed'
    case 'pinning':
      return 'queued'
    default:
      return status
  }
}

const baseURL = 'https://gw3.io'
const providerName = 'Gateway3'

export const uploadOnGW3: UploadFunction = async ({
  token,
  car,
  cid,
  accessKey,
}) => {
  if (!accessKey) throw new MissingKeyError('GW3_ACCESS_KEY')
  if (car) {
    const res1 = await fetch(
      new URL(`https://gw3.io/api/v0/dag/import?size=${car!.size}&ts=${getTs()}`, baseURL),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Access-Key': accessKey,
          'X-Access-Secret': token,
        },
      },
    )
    const json = await res1.json()
    if (!res1.ok || json.code !== 200) {
      throw new DeployError(
        providerName,
        json.msg,
      )
    }
    const fd = new FormData()

    fd.append('file', car as Blob)

    const res2 = await fetch(json.data.url, {
      method: 'POST',
      body: fd,
    })

    if (!res2.ok) throw new DeployError(providerName, await res2.text())

    return { cid }
  }
  else {
    const res = await fetch(
      new URL(`/api/v0/pin/add?arg=${cid}&ts=${getTs()}`, baseURL),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Access-Key': accessKey,
          'X-Access-Secret': token,
        },
      },
    )

    const json = await res.json()
    if (!res.ok) {
      throw new DeployError(
        providerName,
        (json).msg,
      )
    }

    return { cid }
  }
}

export const statusOnGW3: StatusFunction = async (cid, auth) => {
  if (!auth?.accessKey) throw new MissingKeyError('GW3_ACCESS_KEY')
  if (!auth?.token) throw new MissingKeyError('GW3_TOKEN')

  const res = await fetch(
    `https://account.gw3.io/api/v0/pin?arg=${cid}&limit=100&ts=${getTs()}`,
    {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Access-Key': auth?.accessKey,
        'X-Access-Secret': auth?.token,
      },
    },
  )
  const json = (await res.json()) as {
    code: number
    data: {
      cid: string
      status: GW3PinStatus
    }[]
  }

  if (json.code !== 200) return { pin: 'unknown' }

  const pin = json.data.find(pin => pin.cid === cid)
  if (!pin) return { pin: 'unknown' }

  return { pin: mapGw3StatusToGenericStatus(pin.status) }
}
