import {
  type Ability,
  type Capability,
  type ConnectionView,
  connect,
  type Delegation,
} from '@ucanto/client'
import type { API } from '@ucanto/core'
import { outbound as CAR_outbound } from '@ucanto/transport/car'
import * as HTTP from '@ucanto/transport/http'
import type { AgentData } from './agent-data.js'
import { uploadServicePrincipal, uploadServiceURL } from './constants.js'
import { canDelegateCapability, isExpired, isTooEarly } from './delegations.js'
import { fromDelegation } from './space.js'
import type { DelegationMeta, ResourceQuery, Service } from './types.js'

interface CapabilityQuery {
  can: Ability
  with: ResourceQuery
  nb?: unknown
}

export const connection: ConnectionView<Service> = connect({
  id: uploadServicePrincipal,
  codec: CAR_outbound,
  channel: HTTP.open({
    url: uploadServiceURL,
    method: 'POST',
  }),
})

export class Agent {
  #data: AgentData
  connection: ConnectionView<Service>

  constructor(data: AgentData) {
    this.connection = connection
    this.#data = data
  }

  get issuer() {
    return this.#data.principal
  }

  #delegations(caps: Set<CapabilityQuery>) {
    const values: { delegation: API.Delegation; meta: DelegationMeta }[] = []
    for (const [, value] of this.#data.delegations) {
      if (!isExpired(value.delegation) && !isTooEarly(value.delegation)) {
        // check if we need to filter for caps
        if (caps.size > 0) {
          for (const cap of caps) {
            if (canDelegateCapability(value.delegation, cap as Capability)) {
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

  proofs(caps: Set<CapabilityQuery>) {
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

  async importSpaceFromDelegation(delegation: Delegation) {
    const space = fromDelegation(delegation)

    this.#data.spaces.set(space.did(), {
      ...space.meta,
      name: space.meta.name || '',
    })

    this.#data.addDelegation(delegation)

    return space
  }
}
