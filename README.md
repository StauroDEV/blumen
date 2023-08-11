# blumen

**Blumen** is a CLI to deploy websites on IPFS in a decentralized manner, fully managed by the user.

> Blumen, compared Stauro CLI, is fully self-custodial and is not tied to the Stauro platform.

## Features

- Multi-provider IPFS pinning
- ENS integration
- Gnosis API support

## Getting Started

### Installation

Node.js 18+ is required.

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

### `blumen deploy`

Deploys a directory on IPFS to specified providers and outputs a web-friendly gateway link, along with other useful information.

Upload a custom path:

```sh
$ blumen status /path/to/directory
```

### `blumen status <pin>`

Retrieves pin statuses from providers.

```sh
$ blumen status bafybeibp54tslsez36quqptgzwyda3vo66za3rraujksmsb3d5q247uht4

web3.storage: pinned
Gateway3: pinned
```