import type * as Ucanto from '@ucanto/interface'
import type { Delegation } from '@ucanto/interface'
import { StoreMemory } from './memory-store.js'
import type { AgentMeta, DelegationMeta, SpaceMeta } from './types.js'

/**
 * Data schema used internally by the agent.
 */
interface AgentDataModel {
  meta: AgentMeta
  principal: Ucanto.Signer<Ucanto.DID<'key'>>

  delegations: Map<
    string,
    { meta: DelegationMeta; delegation: Ucanto.Delegation }
  >
}

/**
 * Agent data that is safe to pass to structuredClone() and persisted by stores.
 */
type AgentDataExport = Pick<AgentDataModel, 'meta'> & {
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
  #save: (data: AgentDataExport) => void
  principal: Ucanto.Signer<`did:key:${string}`, Ucanto.SigAlg>
  delegations: Map<
    string,
    { meta: DelegationMeta; delegation: Ucanto.Delegation }
  >
  meta: AgentMeta
  spaces: Map<`did:${string}:${string}`, SpaceMeta> = new Map()

  constructor(
    data: AgentDataModel,
    { store }: { store?: StoreMemory<AgentDataExport> } = {},
  ) {
    this.meta = data.meta
    this.principal = data.principal
    this.delegations = data.delegations
    this.#save = (data) => (store ? store.save(data) : undefined)
  }

  /**
   * Create a new AgentData instance from the passed initialization data.
   */
  static async create(
    init: Pick<AgentDataModel, 'principal'> &
      Partial<Omit<AgentDataModel, 'principal'>>,
  ) {
    const store = new StoreMemory<AgentDataExport>()
    const agentData = new AgentData(
      {
        meta: { name: 'agent', type: 'device', ...init.meta },
        principal: init.principal,
        delegations: new Map(),
      },
      { store },
    )

    await store.save(agentData.export())

    return agentData
  }

  /**
   * Export data in a format safe to pass to `structuredClone()`.
   */
  export(): AgentDataExport {
    const delegations: AgentDataExport['delegations'] = new Map()
    for (const [key, value] of this.delegations) {
      delegations.set(key, {
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
    return { delegations, principal: this.principal.toArchive(), meta: this.meta }
  }

  addDelegation(delegation: Delegation, meta: DelegationMeta = {}): void {
    this.delegations.set(delegation.cid.toString(), {
      delegation,
      meta: meta,
    })
    this.#save(this.export())
  }
}
