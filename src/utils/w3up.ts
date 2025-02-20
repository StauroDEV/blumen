import { CarReader } from '@ipld/car'
import type { Block } from 'ipfs-car'
import { StoreMemory } from '@web3-storage/access/stores/store-memory'
import { Signer } from '@ucanto/principal/ed25519'
import { Agent, AgentData } from '@web3-storage/access/agent'
import { importDAG } from '@ucanto/core/delegation'

async function parseProof(data: string) {
  const blocks: Array<Block<unknown, number, number, 1>> = []
  const reader = await CarReader.fromBytes(Buffer.from(data, 'base64'))
  for await (const block of reader.blocks()) {
    blocks.push(block as Block<unknown, number, number, 1>)
  }
  return importDAG(blocks)
}

export async function setupW3Up({ pk, proof: _proof }: { pk: string, proof: string }) {
  const principal = Signer.parse(pk)
  const agentData = await AgentData.create({ principal }, { store: new StoreMemory() })
  const agent = new Agent(agentData)
  try {
    const proof = await parseProof(_proof)
    const space = await agent.importSpaceFromDelegation(proof)
    await agent.setCurrentSpace(space.did())

    return agent
  }
  catch {
    throw new Error('Failed to parse UCAN proof')
  }
}
