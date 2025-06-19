import * as Client from '@ucanto/client'
import { type API, DID } from '@ucanto/core'
import * as CAR from '@ucanto/transport/car'
import * as HTTP from '@ucanto/transport/http'

import { type AgentData, getSessionProofs } from './agent-data.js'
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

  async addProof(delegation: Client.Delegation) {
    await this.#data.addDelegation(delegation)

    return {}
  }

  #delegations(caps: CapabilityQuery[]) {
    const _caps = new Set(caps)
    const values: Array<{ delegation: API.Delegation; meta: DelegationMeta }> =
      []
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

    const sessions = getSessionProofs(this.#data)

    for (const proof of [...authorizations.values()]) {
      const proofsByIssuer = sessions[proof.asCID.toString()] ?? {}
      const sessionProofs = Object.values(proofsByIssuer).flat()
      for (const sessionProof of sessionProofs) {
        authorizations.set(sessionProof.cid.toString(), sessionProof)
      }
    }
    return [...authorizations.values()]
  }

  async importSpaceFromDelegation(delegation: Client.Delegation) {
    const space = fromDelegation(delegation)

    this.#data.spaces.set(space.did(), { ...space.meta, name: space.name })

    await this.addProof(space.delegation)

    // if we do not have a current space, make this one current
    if (!this.currentSpace()) await this.setCurrentSpace(space.did())

    return space
  }

  async setCurrentSpace(space: `did:key:${string}`) {
    if (!this.#data.spaces.has(space))
      throw new Error(`Agent has no proofs for ${space}.`)

    await this.#data.setCurrentSpace(space)
  }

  /**
   * Get current space DID
   */
  currentSpace() {
    return this.#data.currentSpace
  }
}
