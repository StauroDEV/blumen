# Getting Started

## Environment setup

Obtain API keys from your preferred storage providers by following the official [IPFS](/docs/ipfs) or [Swarm](/docs/swarm) guides. If you plan to set up a multi-sig wallet flow, refer to the [How It Works](/docs/how-it-works) and [Deploying with Safe](/docs/safe) guides for detailed instructions.

> All env variables used by Blumen are prefixed with `BLUMEN_`

Define the keys in your environment in the following format:

```txt
BLUMEN_STORACHA_TOKEN=...
```

## Deployment

Run `blumen deploy`, it will pick up the providers from environment and deploy to them.

```sh
blumen deploy

# 📦 Packing dist (39.96KB)
# 🛈  Root CID: bafybeieg5ighiog2vdb4p64mta4cpulqv56bmyrhwdfff4qomh7z7afbyy
# 🛈  Deploying with providers: Storacha
# ✓ [>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>] Finished in 3s
# ✔ Deployed across all providers

# Open in a browser:
# IPFS:      https://bafybeieao2nmw5njfino26llsokqdbc56pdfq7kudhoc5rrsvp4jk7tlk4.ipfs.dweb.link
# Providers: https://delegated-ipfs.dev/routing/v1/providers/bafybeieao2nmw5njfino26llsokqdbc56pdfq7kudhoc5rrsvp4jk7tlk4
```

Blumen will upload to the first provider and pin on all others. If pinning is not supported by the provider, it will reupload the content.
