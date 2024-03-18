# Getting Started

## Environment setup

Grab API keys from the services you use and define them in your environment (e.g. `.env` or GitHub secrets).

> All env variables used by Blumen must be prefixed with `BLUMEN_`

```txt
BLUMEN_W3S_TOKEN=eyJhb....
BLUMEN_GW3_TOKEN=ZA70...
BLUMEN_GW3_ACCESS_KEY=9e01ce24...
```

## Deployment

Run `blumen deploy`, it will pick up the providers from environment and deploy on them.

```sh
blumen deploy

# 📦 Packing dist (39.96KB)
# 🛈  Root CID: bafybeieg5ighiog2vdb4p64mta4cpulqv56bmyrhwdfff4qomh7z7afbyy
# 🛈  Deploying with providers: web3.storage
# ✓ [>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>] Finished in 3s
# ✔ Deployed across all providers

# Open in a browser:
# IPFS:      https://bafybeieao2nmw5njfino26llsokqdbc56pdfq7kudhoc5rrsvp4jk7tlk4.ipfs.cf-ipfs.com
# Providers: https://delegated-ipfs.dev/routing/v1/providers/bafybeieao2nmw5njfino26llsokqdbc56pdfq7kudhoc5rrsvp4jk7tlk4
```

Blumen will upload on the first provider and pin on all others. If pinning is not supported by the provider, it will reupload the file.
