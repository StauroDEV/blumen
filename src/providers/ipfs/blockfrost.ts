import { DeployError } from "../../errors.js";
import type { PinFunction } from "../../types.js";


const baseURL = 'https://ipfs.blockfrost.io/api/v0'
const providerName = 'Blockfrost'

export const pinOnBlockfrost: PinFunction = async ({ token, cid }) => {
  const res = await fetch(`${baseURL}/ipfs/pin/add/${cid}`, {
    method: 'POST',
    headers: {
      'project_id': token
    }
  })
  const json = await res.json()
  if (!res.ok) throw new DeployError(providerName, json.error.details)

  return {
    cid: json.ipfs_hash,
    status: json.state as 'queued'
  }
}