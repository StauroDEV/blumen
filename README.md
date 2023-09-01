# blumen

**Blumen** is a powerful CLI and API library to deploy web apps on IPFS in a self-custodial manner.

## Features

- **Multi-Provider Deployment**: Deploy your web app simultaneously on multiple IPFS providers, including web3.storage and Gateway3, ensuring redundancy and availability.
- **ENS Integration**: Seamlessly integrate with ENS to update your Content-Hash, making it easier for users to access your web app via ENS.
- **Gnosis Integration**: Update your ENS Content-Hash using a multisig contract on the Gnosis platform, adding an extra layer of security and decentralization.
- **Node.js 16.8+ Support**: Compatible up until Node.js v16.8

## Getting Started

### Installation

Node.js 16.8+ is required.

```sh
pnpm install -g blumen
```

### Environment setup

Grab API keys from the services you use and define them in your environment (e.g. `.env`).

> All env variables used by Blumen must be prefixed with `BLUMEN_`

```env
BLUMEN_W3S_TOKEN=eyJhb....
BLUMEN_GW3_TOKEN=ZA70...
BLUMEN_GW3_ACCESS_KEY=9e01ce24...
```

### Deployment

Running `deploy` will try to use the `dist` folder, otherwise the current directory.

```sh
$ blumen deploy

# 📦 Packing blumen (37.03KB)
# 🌱 Root CID: bafy...
# 📡 Deploying with providers: web3.storage, Estuary
# ✓ [>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>] Finished in 2s
# 🌍 Deployed across all providers
# Success!
# Open in a browser:
# 🪐  IPFS:      https://<CID>.ipfs.dweb.link
# 🛰️  IPFS Scan: https://ipfs-scan.io/?cid=<CID>
```

## Documentation

### CLI

#### `blumen deploy`

Deploys a directory on IPFS to specified providers and outputs a web-friendly gateway link, along with other useful information.

Upload a custom path:

```sh
$ blumen status /path/to/directory
```

#### `blumen status <pin>`

Retrieves pin status from providers.

```sh
$ blumen status bafybeibp54tslsez36quqptgzwyda3vo66za3rraujksmsb3d5q247uht4

web3.storage: pinned
Gateway3: pinned
```

By default, providers are fetched from environment like with the `deploy` command. You can manually specify providers via `--providers` flag, comma separated:

```sh
$ blumen status --providers=web3.storage,Gateway3 bafybeibp54tslsez36quqptgzwyda3vo66za3rraujksmsb3d5q247uht4
```

### API

Blumen exposes some of the functionality as well.

```js
import { walk, packCAR, uploadOnW3S } from 'blumen'
import { assert } from 'node:assert/strict'

const [files, total] = await walk('./dist')

const { blob, cid: actualCid } = await packCAR(files)

const { cid } = await uploadOnW3S({ token: process.env.W3S_TOKEN, car: blob })

assert.equal(cid, actualCid)

const { pin } = await statusOnW3S(cid)

console.log(`Pin status: ${pin}, CID: ${cid}`)
```

This example demonstrates how to use the "Blumen" API to walk through a directory, prepare your files for upload, upload it to web3.storage, and check the IPFS pinning status.