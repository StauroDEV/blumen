# Deploying with Safe

An unique feature that Blumen offers is that it lets you deploy a website on ENS with a [Safe](https://safe.global) multi-sig, thus splitting the domain update process in two stages:

1. An update transaction is created from a delegate. Delegate is a special Ethereum account that does not have access to an ENS name but is allowed to propose transactions to a wallet without actually executing them.
2. One of the Safe owners approves the transaction sent by a delegate and updates an ENS name record.

## Setup

First, we need to create a Safe multi-sig account. It's required to control our ENS name, which will point to our website. If you already have one set up, you can skip this step. If you don't, go to the [Safe app](https://safe.global) and create a new wallet.

After a successful safe creation, you will get your safe's address. Next we need to add a delegate account. A delegate is not allowed to approve transactions but can propose them to the wallet. Unfortunately, it's not possible to create a delegate from the dashboard; we need to use [another web app](https://gnosis-delegator.badger.com) for that. Connect with your browser wallet, choose your safe and then add the delegate address of some other account:

![Delegate app](/delegate.png)

Lastly, add the private key of your delegate to environment variables:

```
BLUMEN_PK=0x...
```

## Running the deployment

Once environment is set up, we can deploy our application by running blumen deploy with our Safe and ENS name:

```sh
blumen deploy --safe=sep:0x... --ens=mydomain.eth
# 📦 Packing app (965.48KB)
# 🟢  Root CID: bafybeieao2nmw5njfino26llsokqdbc56pdfq7kudhoc5rrsvp4jk7tlk4
# 🟢  Deploying with providers: Gateway3, Filebase
# ✓ [>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>] Finished in 5s
# ✔ Deployed across all providers

# Open in a browser:
# IPFS:      https://bafybeieao2nmw5njfino26llsokqdbc56pdfq7kudhoc5rrsvp4jk7tlk4.ipfs.cf-ipfs.com
# Providers: https://delegated-ipfs.dev/routing/v1/providers/bafybeieao2nmw5njfino26llsokqdbc56pdfq7kudhoc5rrsvp4jk7tlk4

# Validating transaction for wallet <0x...>
# Preparing a transaction for Safe <eth:0x...>
# Signing a Safe transaction
# Proposing a Safe transaction
# Transaction proposed to a Safe wallet.
# Open in a browser: https://app.safe.global/transactions/queue?safe=<eth:0x...>
```

Your web app got deployed on IPFS. The last step is approving a transaction proposal to update your ENS name record that points to the CID of your app, which we just deployed.

Go back to the Safe app > Transactions and confirm your deployment:

![Safe app](/safe.jpg)

Once it finishes getting processed, your ENS record should start pointing to your new deployment. Now your web app should be discoverable through any ENS gateway (such as .eth.limo).