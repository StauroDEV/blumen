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

After finishing the deployment, update content hash of an ENS domain to point to the IPFS CID. Equivalent to running `blumen ens` afterwarsd.

```sh
blumen deploy --ens v1rtl.eth
```

### `chain`

Default: `mainnet`
Options: `mainnet`, `goerli`

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