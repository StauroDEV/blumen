import { Signer } from '@ucanto/principal/ed25519'
import { Agent } from './agent.js'
import { AgentData, type AgentDataExport } from './agent-data.js'
import { StoreMemory } from './memory-store.js'
import * as Proof from './proof.js'
import type { SharedSpace } from './space.js'

export async function setup({
  pk,
  proof,
}: {
  pk: string
  proof: string
}): Promise<{ agent: Agent; space: SharedSpace }> {
  const store = new StoreMemory<AgentDataExport>()
  const agentData = new AgentData(
    {
      meta: { name: 'agent', type: 'device' },
      principal: Signer.parse(pk),
      delegations: new Map(),
    },
    { store },
  )

  await store.save(agentData.export())

  const agent = new Agent(agentData)
  try {
    const space = await agent.importSpaceFromDelegation(
      await Proof.parse(proof),
    )

    return { agent, space }
  } catch (e) {
    throw new Error('Failed to parse UCAN proof', { cause: e })
  }
}
