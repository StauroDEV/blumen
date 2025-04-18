# Swarm

## Swarmy

- API token env variables: `BLUMEN_SWARMY_TOKEN`
- Supported methods: Upload

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
blumen deploy --ens blumen.stauro.eth --safe eth:0x...
```

## Bee node

- API token env variables: `BLUMEN_BEE_TOKEN`, `BLUMEN_BEE_URL`
- Supported methods: Upload

1. Fund your node wallet by [depositing BZZ](https://docs.ethswarm.org/docs/develop/access-the-swarm/buy-a-stamp-batch/#fund-your-nodes-wallet).
2. Calculate the amount and depth parameters for a postage stamp batch using the [batch calculator](https://docs.ethswarm.org/docs/develop/access-the-swarm/buy-a-stamp-batch/#time--volume-to-depth--amount-calculator). Select how much storage you need and for how long you would like your website to stay on the network. It is possible to top up a batch later.
3. Buy a postage stamp batch for the [Bee node](https://docs.ethswarm.org/docs/develop/access-the-swarm/buy-a-stamp-batch/#buying-a-stamp-batch):

```sh
curl -sX POST http://localhost:1633/stamps/<amount>/<depth>
# {
#   "batchID": "8fcec40c65841e0c3c56679315a29a6495d32b9ed506f2757e03cdd778552c6b", <-- you need this
#   "txHash": "0x51c77ac171efd930eca8f3a77e3fcd5aca0a7353b84d5562f8e9c13f5907b675"
# }
```

Add the batch ID to the environment variables:

```sh
BLUMEN_BEE_TOKEN=8fcec40c65841e0c3c56679315a29a6495d32b9ed506f2757e03cdd778552c6b
```

Then run the the deployment command:

```sh
blumen deploy --ens blumen.stauro.eth --safe eth:0x...
```