import type { Delegation } from '@ucanto/client'
import { SpaceDID } from '@web3-storage/capabilities/utils'

type SharedSpaceModel = {
  id: `did:key:${string}`
  delegation: Delegation
  meta: { name?: string }
}

class SharedSpace {
  model: SharedSpaceModel
  constructor(model: SharedSpaceModel) {
    this.model = model
  }

  get delegation() {
    return this.model.delegation
  }

  get meta() {
    return this.model.meta
  }

  get name() {
    return this.meta.name ?? ''
  }

  did() {
    return this.model.id
  }
}

export const fromDelegation = (delegation: Delegation) => {
  const result = SpaceDID.read(delegation.capabilities[0].with)
  if (result.error) {
    throw Object.assign(
      new Error(
        `Invalid delegation, expected capabilities[0].with to be DID, ${result.error}`,
      ),
      {
        cause: result.error,
      },
    )
  }

  const meta: { name?: string } = delegation.facts[0]?.space ?? {}

  return new SharedSpace({ id: result.ok, delegation, meta })
}
