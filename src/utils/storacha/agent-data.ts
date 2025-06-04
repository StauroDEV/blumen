import type * as Ucanto from '@ucanto/interface'
import { Signer as EdSigner } from '@ucanto/principal/ed25519'

import { UCAN } from '@web3-storage/capabilities'
import type { UCANAttest } from '@web3-storage/capabilities/types'
import { isExpired } from './delegations.js'
import type { AgentMeta, DelegationMeta, Driver, SpaceMeta } from './types.js'

interface AgentDataOptions {
  store?: Driver<AgentDataExport>
}

/**
 * Data schema used internally by the agent.
 */
interface AgentDataModel {
  meta: AgentMeta
  principal: Ucanto.Signer<Ucanto.DID<'key'>>
  /** @deprecated */
  currentSpace?: Ucanto.DID<'key'>
  /** @deprecated */
  spaces: Map<Ucanto.DID, SpaceMeta>
  delegations: Map<
    string,
    { meta: DelegationMeta; delegation: Ucanto.Delegation }
  >
}

/**
 * Agent data that is safe to pass to structuredClone() and persisted by stores.
 */
type AgentDataExport = Pick<
  AgentDataModel,
  'meta' | 'currentSpace' | 'spaces'
> & {
  principal: Ucanto.SignerArchive<Ucanto.DID, Ucanto.SigAlg>
  delegations: Map<
    string,
    {
      meta: DelegationMeta
      delegation: Array<{ cid: string; bytes: ArrayBuffer }>
    }
  >
}

export class AgentData implements AgentDataModel {
  #save: (data: AgentDataExport) => Promise<void> | void
  principal: Ucanto.Signer<`did:key:${string}`, Ucanto.SigAlg>
  delegations: Map<
    string,
    { meta: DelegationMeta; delegation: Ucanto.Delegation }
  >
  meta: AgentMeta
  spaces: Map<`did:${string}:${string}`, SpaceMeta>
  currentSpace: `did:key:${string}` | undefined

  constructor(data: AgentDataModel, options: AgentDataOptions = {}) {
    this.meta = data.meta
    this.principal = data.principal
    this.spaces = data.spaces
    this.delegations = data.delegations
    this.#save = (data) =>
      options.store ? options.store.save(data) : undefined
  }

  /**
   * Create a new AgentData instance from the passed initialization data.
   *
   * @param {Partial<AgentDataModel>} [init]
   * @param {AgentDataOptions} [options]
   */
  static async create(
    init: Partial<AgentDataModel> = {},
    options: AgentDataOptions = {},
  ) {
    const agentData = new AgentData(
      {
        meta: { name: 'agent', type: 'device', ...init.meta },
        principal: init.principal ?? (await EdSigner.generate()),
        spaces: init.spaces ?? new Map(),
        delegations: init.delegations ?? new Map(),
        currentSpace: init.currentSpace,
      },
      options,
    )
    if (options.store) {
      await options.store.save(agentData.export())
    }
    return agentData
  }

  /**
   * Export data in a format safe to pass to `structuredClone()`.
   */
  export() {
    /** @type {AgentDataExport} */
    const raw: AgentDataExport = {
      meta: this.meta,
      principal: this.principal.toArchive(),
      currentSpace: this.currentSpace,
      spaces: this.spaces,
      delegations: new Map(),
    }
    for (const [key, value] of this.delegations) {
      raw.delegations.set(key, {
        meta: value.meta,
        delegation: [...value.delegation.export()].map((b) => ({
          cid: b.cid.toString(),
          bytes: b.bytes.buffer.slice(
            b.bytes.byteOffset,
            b.bytes.byteOffset + b.bytes.byteLength,
          ) as ArrayBuffer,
        })),
      })
    }
    return raw
  }

  /**
   * @deprecated
   * @param {import('@ucanto/interface').DID<'key'>} did
   */
  async setCurrentSpace(did: import('@ucanto/interface').DID<'key'>) {
    this.currentSpace = did
    await this.#save(this.export())
  }

  async addDelegation(
    delegation: import('@ucanto/interface').Delegation,
    meta?: DelegationMeta,
  ) {
    this.delegations.set(delegation.cid.toString(), {
      delegation,
      meta: meta ?? {},
    })
    await this.#save(this.export())
  }
}

const isSessionCapability = (cap: Ucanto.Capability): boolean =>
  cap.can === UCAN.attest.can

const isSessionProof = (
  delegation: Ucanto.Delegation,
): delegation is Ucanto.Delegation<[UCANAttest]> =>
  delegation.capabilities.some((cap) => isSessionCapability(cap))

type SessionProofIndexedByAuthorizationAndIssuer = Record<
  string,
  Record<Ucanto.DID, [Ucanto.Delegation, ...Ucanto.Delegation[]]>
>

export function getSessionProofs(
  data: AgentData,
): SessionProofIndexedByAuthorizationAndIssuer {
  const proofs: SessionProofIndexedByAuthorizationAndIssuer = {}
  for (const { delegation } of data.delegations.values()) {
    if (isSessionProof(delegation)) {
      const cap = delegation.capabilities[0]
      if (cap && !isExpired(delegation)) {
        const proof = cap.nb.proof
        if (proof) {
          const proofCid = proof.toString()
          const issuerDid = delegation.issuer.did()
          proofs[proofCid] = proofs[proofCid] ?? {}
          proofs[proofCid][issuerDid] = proofs[proofCid][issuerDid] ?? []
          proofs[proofCid][issuerDid].push(delegation)
        }
      }
    }
  }
  return proofs
}
