# `blumen deploy`

Deploys content on IPFS to specified providers and outputs a web-friendly gateway link, along with other useful information. If a directory is not specified, uses `dist` by default.

```sh
blumen deploy [dir]
```

## Options

### `strict`

Default: `false`

Throw an error if one of the providers fails to deploy.

```sh
blumen deploy --strict
```

### `ens`

Default: empty

After finishing the deployment, update content hash of an ENS domain to point to the IPFS CID. Equivalent to running `blumen ens` afterwards.

```sh
blumen deploy --ens v1rtl.eth
```

### `resolver-address`

Use a custom ENS Resolver address. Resolvers for mainnet and sepolia are set by default.

### `chain`

Default: `mainnet`
Options: `mainnet`, `sepolia`

EVM Chain to use for ENS deployment. Requires `--ens` option to be defined.

```sh
blumen deploy --chain mainnet --ens v1rtl.eth
```

### `name`

Name of the distribution directory, excluding the file extension (it's always `.car`). By default the current directory name is used.

```sh
blumen deploy --name my-dapp
```

### `dist`

Custom directory to store the distribution file at before deployment. By default, OS temporary directory is used. Might be useful for verifying/signing integrity of distribution before deployment.

```sh
blumen deploy --dist ./
file ./dist.car
```

### `providers`

A list of providers to deploy on.

```sh
blumen deploy --providers web3.storage bafybeibp54tslsez36quqptgzwyda3vo66za3rraujksmsb3d5q247uht4 
```

### `verbose`

More verbose logs.

```sh
blumen deploy --verbose --providers=Gateway3

# 📦 Packing dist (30.99KB)
# 🟢 Root CID: bafybeihw4r72ynkl2zv4od2ru4537qx2zxjkwlzddadqmochzhe524t7qu
# 🟢 Deploying with providers: Gateway3
# POST https://gw3.io/api/v0/dag/import?size=33547&ts=... 200
# POST https://some-node.gtw3.io/api/v0/dag/import?sargs=...-...-...-...&ssig=.......-...-...%3D%3D 200
# POST https://gw3.io/api/v0/pin/add?arg=...&ts=...&name=dist 200
# ✓ [>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>] Finished in 3s
# ✔ Deployed across all providers
# Open in a browser:
# IPFS:      https://bafybeihw4r72ynkl2zv4od2ru4537qx2zxjkwlzddadqmochzhe524t7qu.ipfs.dweb.link
# Providers: https://delegated-ipfs.dev/routing/v1/providers/bafybeihw4r72ynkl2zv4od2ru4537qx2zxjkwlzddadqmochzhe524t7qu
```

### `safe` (Recommended)

Deploy using a [Safe](https://safe.global) multisig wallet. Requires private key of a Safe owner/delegate to sign a transaction. [EIP-3770](https://eips.ethereum.org/EIPS/eip-3770) addresses are supported.

```sh
blumen ens bafybeibp54tslsez36quqptgzwyda3vo66za3rraujksmsb3d5q247uht4 v1rtl.eth --safe sep:0x1234567890000000000000000000000000000000 --chain sepolia
```

### `dnslink`

Update DNSLink. After finishing the deployment, DNSLink is updated afterwards (or after ENS if it was included in the deployment). Equivalent to `blumen dnslink <cid>`

```sh
blumen deploy --dnslink
```