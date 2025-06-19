import { CarReader } from '@ipld/car/reader'
import { importDAG } from '@ucanto/core/delegation'
import { Signer } from '@ucanto/principal/ed25519'
import { Agent } from './agent.js'
import { AgentData } from './agent-data.js'

async function parseProof(data: string) {
  const blocks: Array<Signer.Transport.Block> = []
  const reader = await CarReader.fromBytes(Buffer.from(data, 'base64'))
  for await (const block of reader.blocks()) blocks.push(block as Signer.Transport.Block)

  return importDAG(blocks)
}

export async function setup({
  pk,
  proof: _proof,
}: {
  pk: string
  proof: string
}) {
  const agentData = await AgentData.create({ principal: Signer.parse(pk) })
  const agent = new Agent(agentData)
  try {
    const proof = await parseProof(_proof)
    const space = await agent.importSpaceFromDelegation(proof)
    await agent.setCurrentSpace(space.did())

    return agent
  } catch {
    throw new Error('Failed to parse UCAN proof')
  }
}
