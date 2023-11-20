import { DeployError } from '../errors.js'
import { UploadFunction } from '../types.js'

const providerName = 'Lighthouse'

export const uploadOnLighthouse: UploadFunction = async ({ car, cid, name, token }) => {
  if (car) {
    const depotTokenRes = await fetch('https://data-depot.lighthouse.storage/api/auth/lighthouse_auth', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    const depotTokenJson = await depotTokenRes.json()

    if (!depotTokenRes.ok) throw new DeployError(providerName, depotTokenJson)

    const fd = new FormData()
    fd.append('file', car as Blob)
    const res = await fetch('https://data-depot.lighthouse.storage/api/upload/upload_files', {
      method: 'POST',
      body: fd,
      headers: {
        Authorization: `Bearer ${depotTokenJson.access_token}`,
      },
    })
    const json = await res.text()

    if (!res.ok) throw new DeployError(providerName, json)

    return { cid }
  }
  else {
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
}
