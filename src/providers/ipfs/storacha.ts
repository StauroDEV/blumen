import * as client from '@ucanto/client'
import { DID } from '@ucanto/core'
import * as CAR from '@ucanto/transport/car'
import * as HTTP from '@ucanto/transport/http'
import {
  Blob as BlobCapabilities,
  Filecoin as FilecoinCapabilities,
  Index as IndexCapabilities,
  Upload as UploadCapabilities,
} from '@web3-storage/capabilities'
import { uploadCAR } from '@web3-storage/upload-client'
import { DeployError, MissingKeyError } from '../../errors.js'
import type { UploadFunction } from '../../types.js'
import { setup } from '../../utils/storacha/setup.js'

const providerName = 'Storacha'

export const uploadServiceURL = new URL('https://up.web3.storage')
export const uploadServicePrincipal = DID.parse('did:web:web3.storage')

const uploadServiceConnection = client.connect({
  id: uploadServicePrincipal,
  codec: CAR.outbound,
  channel: HTTP.open<Record<string, unknown>>({
    url: uploadServiceURL,
    method: 'POST',
  }),
})

export const uploadOnWStoracha: UploadFunction<{ proof: string }> = async ({
  token,
  car,
  proof,
}) => {
  if (!proof) throw new MissingKeyError(`STORACHA_PROOF`)

  const agent = await setup({ pk: token, proof })

  const resource = agent.currentSpace()!

  const abilities = [
    BlobCapabilities.add.can,
    IndexCapabilities.add.can,
    FilecoinCapabilities.offer.can,
    UploadCapabilities.add.can,
  ]
  const issuer = agent.issuer
  const proofs = agent.proofs(abilities.map((can) => ({ can, with: resource })))
  const audience = uploadServiceConnection.id

  try {
    const cid = await uploadCAR(
      { issuer, proofs, audience, with: resource },
      car,
    )

    return { cid: cid.toV1().toString() }
  } catch (e) {
    throw new DeployError(providerName, (e as Error).message)
  }
}
