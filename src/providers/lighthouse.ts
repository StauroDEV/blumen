import { DeployError, MissingKeyError } from '../errors.js'
import { StatusFunction, UploadArgs, UploadFunction } from '../types.js'
import { logger } from '../utils/logger.js'

const providerName = 'Lighthouse'

const getDepotToken = async (token: string, { verbose }: Pick<UploadArgs, 'verbose'>) => {
  const res = await fetch('https://data-depot.lighthouse.storage/api/auth/lighthouse_auth', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (verbose) logger.request('GET', res.url, res.status)

  const depotTokenJson = await res.json()

  if (!res.ok) throw new DeployError(providerName, depotTokenJson)

  return depotTokenJson.access_token
}

export const uploadOnLighthouse: UploadFunction = async ({ car, cid, name, token, first, verbose }) => {
  if (first) {
    const depotToken = await getDepotToken(token, { verbose })

    const fd = new FormData()
    fd.append('file', car as Blob)
    const res = await fetch('https://data-depot.lighthouse.storage/api/upload/upload_files', {
      method: 'POST',
      body: fd,
      headers: {
        Authorization: `Bearer ${depotToken}`,
      },
    })

    if (verbose) logger.request('POST', res.url, res.status)

    const json = await res.json()

    if (!res.ok) throw new DeployError(providerName, json)
  }

  const res = await fetch(new URL('/api/lighthouse/pin', 'https://api.lighthouse.storage'), {
    method: 'POST',
    body: JSON.stringify({
      cid, fileName: name,
    }),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  })

  const json = await res.json()

  if (!res.ok) throw new DeployError(providerName, json.errors[0].message)

  return { cid }
}

export const statusOnLighthouse: StatusFunction = async ({ cid, auth, verbose }) => {
  if (!auth.token) throw new MissingKeyError(`LIGHTHOUSE_TOKEN`)

  const depotToken = await getDepotToken(auth.token, { verbose })

  const res = await fetch(`https://data-depot.lighthouse.storage/api/data/get_user_uploads?pageNo=1`, {
    headers: {
      Authorization: `Bearer ${depotToken}`,
    },
  },
  )

  const json = await res.json() as {
    pieceCid: string
    fileName: string
    payloadCid: string
    mimeType: `${string}/${string}`
    userName: string
    createdAt: number
    carSize: number
    lastUpdate: number
    fileStatus: string
    fileSize: number
    id: string
    pieceSize: number
  }[]

  if (json.find(pin => pin.payloadCid === cid || pin.pieceCid === cid)) return { pin: 'pinned' }

  return { pin: 'not pinned' }
}
