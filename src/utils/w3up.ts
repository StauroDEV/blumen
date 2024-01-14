import * as Signer from '@ucanto/principal/ed25519'
import * as Client from '@web3-storage/w3up-client'
import { importDAG } from '@ucanto/core/delegation'
import { CarReader } from '@ipld/car'
import { Block } from '@ipld/unixfs'

export async function setupW3Up({ pk, proof: _proof }: { pk: string, proof: string }) {
  // Load client with specific private key
  const principal = Signer.parse(pk)
  const client = await Client.create({ principal })
  // Add proof that this agent has been delegated capabilities on the space
  const proof = await parseProof(_proof)
  const space = await client.addSpace(proof)
  await client.setCurrentSpace(space.did())

  return client
}

async function parseProof(data: string) {
  const blocks: Block<unknown, number, number, 1>[] = []
  const reader = await CarReader.fromBytes(Buffer.from(data, 'base64'))
  for await (const block of reader.blocks()) {
    blocks.push(block as Block<unknown, number, number, 1>)
  }
  return importDAG(blocks)
}
