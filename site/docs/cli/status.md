# `blumen status`

Checks the deployment status of a IPFS CID across providers.

```sh
blumen status <cid>
```

By default obtains providers from environment (via `BLUMEN_` env variables).

## Options

### `providers`

A list of providers to check the deployment status for.

```sh
blumen status bafybeibp54tslsez36quqptgzwyda3vo66za3rraujksmsb3d5q247uht4 --providers web3.storage
```
