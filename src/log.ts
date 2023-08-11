import kleur from 'kleur'
import { table } from 'table'
import type { CID } from 'multiformats/cid'
import { FilecoinDeal, PinStatus } from './types.js'

const packing = (dir: string, size: string) =>
  console.log(`📦 Packing ${kleur.cyan(dir)} (${size})`)

const root = (cid: CID) =>
  console.log(`🌱 Root CID: ${kleur.white(cid.toString())}`)

const providersList = (providers: string[]) =>
  console.log(`📡 Deploying with providers: ${providers.join(', ')}`)

const uploadFinished = () => console.log(`🌍 Deployed across all providers`)

const deployFinished = (cid: string) =>
  console.log(
    `${kleur.cyan('Success!')}\nOpen in a browser:\n${kleur.bold(
      '🪐 IPFS'
    )}:      ${kleur.underline(`https://${cid}.ipfs.dweb.link`)}\n${kleur.bold(
      '🛰️  IPFS Scan'
    )}: ${kleur.underline(`https://ipfs-scan.io/?cid=${cid}`)}`
  )

const pinStatus = (
  provider: string,
  status: PinStatus,
  deals?: FilecoinDeal[]
) => {
  let statusText: string

  switch (status) {
    case 'pinned':
      statusText = kleur.green(status)
      break
    case 'queued':
      statusText = kleur.cyan(status)
      break
    case 'unknown':
      statusText = kleur.gray(status)
      break
  }

  console.log(`${kleur.cyan(provider)}: ${kleur.bold(statusText)}`)

  if (deals) {
    table(
      deals.map(({ dealId, status }) => [dealId, status]),
      { header: { alignment: 'left', content: 'Filecoin deals' } }
    )
  }
}

export {
  packing,
  root,
  providersList,
  uploadFinished,
  deployFinished,
  pinStatus,
}
