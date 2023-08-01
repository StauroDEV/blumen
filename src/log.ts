import kleur from 'kleur'
import type { CID } from 'multiformats/cid'

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

export { packing, root, providersList, uploadFinished, deployFinished }
