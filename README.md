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

### Deploying a static app

```sh
blumen deploy
#📦 Packing blumen (37.03KB)
#🌱 Root CID: bafy...
#📡 Deploying with providers: web3.storage, Estuary
#✓ [>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>] Finished in 2s
#🌍 Deployed across all providers
#Success!
#Open in a browser:
#🪐  IPFS:      https://<CID>.ipfs.dweb.link
#🛰️  IPFS Scan: https://ipfs-scan.io/?cid=<CID>
```

### Environment setup

You can either pass provider API tokens to the environment:

```env
BLUMEN_ESTUARY_TOKEN=
BLUMEN_FILEBASE_TOKEN=
BLUMEN_GW3_TOKEN=
BLUMEN_ETH_PK=
```

### Documentation

TBD
