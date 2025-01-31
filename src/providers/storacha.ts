import type { UploadFunction } from '../types.js'
import { DeployError, MissingKeyError } from '../errors.js'
import { setupW3Up } from '../utils/w3up.js'

const providerName = 'Storacha'

export const uploadOnWStoracha: UploadFunction<{ proof: string }> = async ({
  token,
  car,
  proof,
}) => {
  if (!proof) throw new MissingKeyError(`W3S_PROOF`)

  const client = await setupW3Up({ pk: token, proof })

  try {
    const cid = await client.uploadCAR(car)

    return { cid: cid.toV1().toString() }
  }
  catch (e) {
    throw new DeployError(providerName, (e as Error).message)
  }
}
