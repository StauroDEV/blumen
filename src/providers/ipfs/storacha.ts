import { DeployError, MissingKeyError } from '../../errors.js'
import type { UploadFunction } from '../../types.js'
import { setup } from '../../utils/storacha/setup.js'
import { uploadCAR } from '../../utils/storacha/upload-car.js'

export {
  uploadServicePrincipal,
  uploadServiceURL,
} from '../../utils/storacha/constants.js'

const providerName = 'Storacha'

export const uploadOnWStoracha: UploadFunction<{ proof: string }> = async ({
  token,
  car,
  proof,
}) => {
  if (!proof) throw new MissingKeyError(`STORACHA_PROOF`)

  const agent = await setup({ pk: token, proof })

  const resource = agent.currentSpace()

  if (!resource) throw new Error('No space found')

  const abilities = ['space/blob/add', 'upload/add'] as const

  try {
    const cid = await uploadCAR(
      {
        issuer: agent.issuer,
        proofs: agent.proofs(abilities.map((can) => ({ can, with: resource }))),
        with: resource,
      },
      car,
    )

    return { cid: cid.toString() }
  } catch (e) {
    throw new DeployError(providerName, (e as Error).message, { cause: e })
  }
}
