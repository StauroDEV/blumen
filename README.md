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
# > Packing example_app (4.32MB)
# > IPFS CID: baq...
# > Deploying across multiple providers: Estuary, Filebase, Gateway3
# ◉-----◌-----◌-----◌ 0%
# Uploading to Estuary
# ◉=====◉-----◌-----◌ 25%
# Pinning on Filebase
# ◉=====◉=====◉-----◌ 50%
# Pinning on Gateway3
# ◉=====◉=====◉=====◉
# Deployed on all providers!
# > Updating ENS Content Hash (mywebsite.eth)
# > Pending transaction:
# > https://etherscan.io/tx/...
# > Success!
# > Open in a browser:
# > IPFS: https://baq....dweb.link
# > ENS: https://mywebsite.eth.limo
# > IPFS Scan: https://ipfs-scan.com/...
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
