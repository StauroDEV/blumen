# `blumen ens`

Updates ENS domain Content-Hash with an IFPS CID.

```sh
blumen ens bafybeibp54tslsez36quqptgzwyda3vo66za3rraujksmsb3d5q247uht4 v1rtl.eth
```

Requires a ENS owner's private key (`BLUMEN_PK`) to be defined.

::: warn

It is recommended to use multisig wallets for deployments instead of using a private key of an Ethereum wallet to ensure security.

:::

### `ens`

After finishing the deployment, update content hash of an ENS domain to point to the deployment. Equivalent to `blumen ens`.

### `chain`

Default: `mainnet`
Options: `mainnet`, `goerli`

EVM Chain to use for ENS deployment. Requires `--ens` option to be defined.

### `safe` (Recommended)

Deploy using a [Safe](https://safe.global) multisig wallet. Requires private key of a Safe owner/delegate to sign a transaction. [EIP-3770](https://eips.ethereum.org/EIPS/eip-3770) addresses are supported.

```sh
blumen ens bafybeibp54tslsez36quqptgzwyda3vo66za3rraujksmsb3d5q247uht4 v1rtl.eth --safe gor:0x1234567890000000000000000000000000000000 --chain goerli
```

### `rpc-url`

Use a custom Ethereum RPC for transactions. By default, [Ankr RPCs](https://ankr.com/rpc) are used.
