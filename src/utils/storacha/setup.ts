import { Signer } from '@ucanto/principal/ed25519'
import { Agent } from './agent.js'
import { AgentData } from './agent-data.js'
import * as Proof from './proof.js'
import type { SharedSpace } from './space.js'

export async function setup({
  pk,
  proof,
}: {
  pk: string
  proof: string
}): Promise<{ agent: Agent; space: SharedSpace }> {
  const agentData = await AgentData.create({ principal: Signer.parse(pk) })
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
