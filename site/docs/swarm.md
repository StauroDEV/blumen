# Swarm

Blumen supports uploading on the [Swarm](https://ethswarm.org) decentralized network via [Swarmy](https://swarmy.cloud), a storage provider. A website is not possible to upload both on Swarm and IPFS, so when opting in for Swarmy, other providers will be ignored.

## Setup

To use Swarmy, you need to create an account on [Swarmy](https://swarmy.cloud). Afterwards, you should request a storage quota on the "Billing" page.

![](/swarm-billing.png)

After receiving your storage quota, generate an API key from the "API Keys" section.

![](/swarm-key.png)

## Running the deployment

Once you have your API key, put it in the environment variables:

```
BLUMEN_SWARMY_TOKEN=123...
```

Then run the deployment command:

```sh
blumen deploy --swarmy --ens blumen.stauro.eth --safe eth:0x...
```