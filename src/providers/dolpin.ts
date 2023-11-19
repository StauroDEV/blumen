import { PinningNotSupportedError } from '../errors.js'
import type { UploadFunction } from '../types.js'

const baseURL = 'https://gateway.dolpin.io'
const providerName = 'Dolpin'

export const uploadOnDolpin: UploadFunction = async ({
  token, car, cid, name,
}) => {
  if (cid) throw new PinningNotSupportedError(providerName)

  const fd = new FormData()

  fd.append('files', car as Blob)

  fd.append('name', name)

  console.log(fd.entries())

  const res = await fetch(new URL(`/api/v1/documents/upload-in-cluster-with-api?api_token=${token}`, baseURL), {
    method: 'POST',
    body: fd,
  })

  const json = await res.json()

  return json
}
