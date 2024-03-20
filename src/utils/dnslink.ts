import { CLOUDFLARE_API_URL } from '../constants.js'
import { DnsLinkError, MissingDnsLinkError } from '../errors.js'

// export const createDnsLink = async (
//   { cid, zoneId, apiKey }:
//   { cid: string, zoneId: string, apiKey: string },
// ) => {
//   const res = await fetch(`${CLOUDFLARE_API_URL}/zones/${zoneId}/web3/hostnames`, {
//     method: 'POST',
//     headers: {
//       'Authorization': `Bearer ${apiKey}`,
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       dnslink: `/ipfs/${cid}`,
//       description: `Powered by Blumen`,
//       target: 'ipfs',
//     }),
//   })
//   const json = await res.json()

//   if (!res.ok) throw new DnsLinkError(json.errors[0].message)

//   return json
// }

export const updateDnsLink = async (
  { cid, zoneId, apiKey, name }:
  { cid: string, zoneId: string, apiKey: string, name: string },
) => {
  const res = await fetch(`${CLOUDFLARE_API_URL}/zones/${zoneId}/web3/hostnames`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  })
  const json = await res.json() as { result: { name: string }[], errors: { message: string, code: number }[] }

  if (!res.ok) throw new DnsLinkError(json.errors[0].message)

  if (!json.result.length) throw new MissingDnsLinkError()

  const recordId = json.result.find(item => name === item.name)

  return await fetch(`${CLOUDFLARE_API_URL}/zones/${zoneId}/web3/hostnames/${recordId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      dnslink: `/ipfs/${cid}`,
      description: `Powered by Blumen`,
    }),
  })
    .then(res => res.json())
}
