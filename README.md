# blumen

**Blumen** is a CLI to deploy websites on IPFS in a decentralized manner, fully managed by the user.

> Blumen, compared Stauro CLI, is fully self-custodial and is not tied to the Stauro platform.

## Getting Started

### Installation

Node.js 18+ is required.

```sh
pnpm install -g blumen
blumen deploy
# > Packing example_app (4.32MB)
# > IPFS CID: baq...
# > Deploying across multiple providers: Estuary, Filebase, Gateway3
# > Estuary  [====--------------] 20%
# > Filebase [======------------] 32%
# > Gateway3 [==----------------] 10%
# > Updating ENS Content Hash (mywebsite.eth)
# > Pending transaction:
# > https://etherscan.io/tx/...
# > Success! Pinned on 3 providers and updated ENS
# > Open in the browser:
# > IPFS: https://baq....dweb.link
# > ENS: https://mywebsite.eth.limo
```

### Environment setup

You can either pass provider API tokens to the environment:

```env
BLUMEN_ESTUARY_TOKEN=
BLUMEN_FILEBASE_TOKEN=
BLUMEN_GW3_TOKEN=
BLUMEN_ETH_PK=
```

or as CLI arguments:

```sh
blumen deploy --estuary-token=<...> --filebase-token=<...>
```

### Documentation

TBD
