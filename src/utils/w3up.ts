import * as Signer from '@ucanto/principal/ed25519'
import * as Client from '@web3-storage/w3up-client'
import { StoreMemory } from '@web3-storage/access/stores/store-memory'
import { importDAG } from '@ucanto/core/delegation'
import { CarReader } from '@ipld/car'

export async function setupW3Up({ pk, proof: _proof }: { pk: string, proof: string }) {
  const principal = Signer.parse(pk)
  const client = await Client.create({ principal, store: new StoreMemory() })
  try {
    const proof = await parseProof(_proof)
    const space = await client.addSpace(proof)
    await client.setCurrentSpace(space.did())

    return client
  }
  catch {
    throw new Error('Failed to parse UCAN proof')
  }
}

async function parseProof(data: string) {
  const blocks = []
  const reader = await CarReader.fromBytes(Buffer.from(data, 'base64'))
  for await (const block of reader.blocks()) {
    blocks.push(block)
  }
  return importDAG(blocks)
}
