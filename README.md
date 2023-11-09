<div align="center">

<img src="logo.png" height="200" width="200" />
<h1>Blumen</h1>

[![CI](https://github.com/StauroXYZ/blumen/actions/workflows/ci.yml/badge.svg)](https://github.com/StauroXYZ/blumen/actions/workflows/ci.yml) ![npm](https://img.shields.io/npm/dt/blumen?style=for-the-badge&logo=npm&color=%232B4AD4&label)

<sub>Self-custodial decentralized deployments</sub>
</div>


**Blumen** is a CLI and API library to deploy apps on the decentralized web using IPFS and Ethereum.

> Blumen is in an alpha stage and has been neither audited nor tested yet. Use with caution!

## Features

- **Multi-Provider Deployment**: Deploy your web app simultaneously on multiple IPFS providers, including [web3.storage](https://web3.storage) and [Gateway3](https://gateway3.io), ensuring redundancy and availability.
- **ENS Integration**: Seamlessly integrate with [ENS](https://ens.domains) to update your Content-Hash, making it easier for users to access your web app via ENS gateways.
- **Safe Integration**: Update your ENS Content-Hash using a multisig [Safe](https://safe.global) contract, adding an extra layer of security and decentralization.

## Getting Started

### Installation

Node.js 16.8+ is required.

> Warning: Support for Node 16.8 will be removed in the future. Node 18 is recommended.

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

# ◐ Packing dist (56.27KB)                                                                                                            
# ℹ Root CID: bafybeibp54tslsez36quqptgzwyda3vo66za3rraujksmsb3d5q247uht4                                                          
# ℹ Deploying with providers: web3.storage                                                                                           
# ✓ [>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>] Finished in 3s
# ✔ Deployed across all providers
```

## Documentation

### CLI

#### `blumen deploy`

Deploys a directory on IPFS to specified providers and outputs a web-friendly gateway link, along with other useful information.

Upload a custom path:

```sh
$ blumen deploy /path/to/directory
```

You can update your ENS domain record in-place by passing a domain (and optionally a chain) and a `BLUMEN_PK` environment variable:

```sh
$ BLUMEN_W3S_TOKEN=eyJhbG... BLUMEN_PK=0x2... ./dist/cli.js deploy dist --ens v1rtl.eth --chain goerli
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

#### `blumen ens <cid> <ens>`

Update ENS Content-Hash from the CLI. Requires a `BLUMEN_PK` environment variable (for private key).

```sh
$ BLUMEN_PK=0x2... blumen ens bafybeibp54tslsez36quqptgzwyda3vo66za3rraujksmsb3d5q247uht4 v1rtl.eth
```

If you are doing testing, you can pass `--chain goerli` to use Goerli network instead of mainnet.

##### Safe multisig

You can also update your ENS name as a [Safe](https://safe.global) owner or delegate by specifying the safe's address and the operation type (0 - (default) for owners, 1 - for delegates). ENS name should be owned by a Safe, and a delegate's private key has to be provided to generate a transaction signature for Safe.

> [EIP-3770](https://eips.ethereum.org/EIPS/eip-3770) addresses are also supported.

```sh
$  BLUMEN_PK=0x2... blumen ens bafybeibp54tslsez36quqptgzwyda3vo66za3rraujksmsb3d5q247uht4 v1rtl.eth --safe eth:0x0000000000000000000000000000000000000000 --operation-type 1

# ℹ Validating transaction for wallet 0x0000000000000000000000000000000000000000
# ℹ Preparing a transaction for Safe eth:0x0000000000000000000000000000000000000000                             
# ℹ Signing a Safe transaction                                                                                  
# ℹ Proposing a Safe transaction                                                                                
# ✔ Transaction proposed to a Safe wallet.                                                                      
# Open in a browser: https://app.safe.global/transactions/queue?safe=eth:0x0000000000000000000000000000000000000000
```

After submitting the transaction, open your Safe app and approve it.

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

This example demonstrates how to use the Blumen API to walk through a directory, prepare your files for upload, upload it to web3.storage, and check the IPFS pinning status.
