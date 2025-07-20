import { type BytesReader, createDecoder } from '@ipld/car/decoder'
import { Delegation } from '@ucanto/core/delegation'
import { Signer, type UCANBlock } from '@ucanto/principal/ed25519'
import { Agent } from './agent.js'
import { AgentData } from './agent-data.js'

const bytesReader = (bytes: Uint8Array): BytesReader => {
  let pos = 0

  return {
    async upTo(length) {
      return bytes.subarray(pos, pos + Math.min(length, bytes.length - pos))
    },

    async exactly(length, seek = false) {
      if (length > bytes.length - pos) throw new Error('Unexpected end of data')

      const out = bytes.subarray(pos, pos + length)
      if (seek) pos += length

      return out
    },

    seek(length) {
      pos += length
    },

    get pos() {
      return pos
    },
  }
}

async function parseProof(proof: string) {
  const reader = bytesReader(Buffer.from(proof, 'base64'))

  const decoder = createDecoder(reader)

  let entries: [string, Signer.Transport.Block][] = []
  for await (const block of decoder.blocks())
    entries.push([block.cid.toString(), block as Signer.Transport.Block])

  const last = entries.pop()!

  const [, root] = last

  return new Delegation(root as UCANBlock, new Map(entries))
}

export async function setup({ pk, proof }: { pk: string; proof: string }) {
  const agentData = await AgentData.create({ principal: Signer.parse(pk) })
  const agent = new Agent(agentData)
  try {
    await agent.importSpaceFromDelegation(await parseProof(proof))

    return agent
  } catch {
    throw new Error('Failed to parse UCAN proof')
  }
}
