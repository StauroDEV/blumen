import * as Client from '@ucanto/client'
import { type API, DID } from '@ucanto/core'
import * as CAR from '@ucanto/transport/car'
import * as HTTP from '@ucanto/transport/http'

import type { AgentData } from './agent-data.js'
import { canDelegateCapability, isExpired, isTooEarly } from './delegations.js'
import { fromDelegation } from './space.js'
import type { DelegationMeta, ResourceQuery } from './types.js'

interface CapabilityQuery {
  can: Client.Ability
  with: ResourceQuery
  nb?: unknown
}

const HOST = new URL('https://up.web3.storage')
const PRINCIPAL = DID.parse('did:web:web3.storage')

export class Agent {
  #data: AgentData
  connection: Client.ConnectionView<Record<string, any>>

  constructor(data: AgentData) {
    this.connection = Client.connect({
      id: PRINCIPAL,
      codec: CAR.outbound,
      channel: HTTP.open({
        url: HOST,
        method: 'POST',
      }),
    })
    this.#data = data
  }

  get issuer() {
    return this.#data.principal
  }

  #delegations(caps: CapabilityQuery[]) {
    const _caps = new Set(caps)
    const values: { delegation: API.Delegation; meta: DelegationMeta }[] = []
    for (const [, value] of this.#data.delegations) {
      if (!isExpired(value.delegation) && !isTooEarly(value.delegation)) {
        // check if we need to filter for caps
        if (Array.isArray(caps) && caps.length > 0) {
          for (const cap of _caps) {
            if (
              canDelegateCapability(value.delegation, cap as Client.Capability)
            ) {
              values.push(value)
            }
          }
        } else {
          values.push(value)
        }
      }
    }
    return values
  }

  proofs(caps: CapabilityQuery[]) {
    const authorizations: Map<
      string,
      API.Delegation<API.Capabilities>
    > = new Map()
    for (const { delegation } of this.#delegations(caps)) {
      if (delegation.audience.did() === this.issuer.did()) {
        authorizations.set(delegation.cid.toString(), delegation)
      }
    }

    return [...authorizations.values()]
  }

  async importSpaceFromDelegation(delegation: Client.Delegation) {
    const space = fromDelegation(delegation)

    this.#data.spaces.set(space.did(), {
      ...space.meta,
      name: space.meta.name || '',
    })

    await this.#data.addDelegation(delegation)

    // if we do not have a current space, make this one current
    if (!this.currentSpace()) await this.#data.setCurrentSpace(space.did())

    return space
  }

  /**
   * Get current space DID
   */
  currentSpace() {
    return this.#data.currentSpace
  }
}
