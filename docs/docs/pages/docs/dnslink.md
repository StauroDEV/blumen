# DNSLink

Blumen supports automatic DNS updates via [DNSLink](https://dnslink.dev). Right now only Cloudflare is supported.

## Setup

### Cloudflare

Obtain Zone ID from the Cloudflare dashboard:

![Zone ID](/cf-zone-id.png)

You will also need an API token with permissions for editing Web3 gateways:

![CF Token](/cf-token.png)

Add your Zone ID and API token to environment:

```
BLUMEN_CF_KEY=...-...
BLUMEN_CF_ZONE_ID=...
```

## Running the deployment

Once all the environment variables are ready, you simply have to pass a `--dnslink` flag and Blumen will automatically update DNSLink value:

```
📦 Packing .vitepress/dist (7.76MB)
🟢 Root CID: bafybeic5ddic5i25eoee2bhw4br4cug45xeemhtsyklbj3kld6a6gcjv5u
🟢 Deploying with providers: Storacha, Filebase
✓ [>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>] Finished in 15s
✔ Deployed across all providers

Open in a browser:
IPFS:      https://bafybeic5ddic5i25eoee2bhw4br4cug45xeemhtsyklbj3kld6a6gcjv5u.ipfs.dweb.link
Providers: https://delegated-ipfs.dev/routing/v1/providers/bafybeic5ddic5i25eoee2bhw4br4cug45xeemhtsyklbj3kld6a6gcjv5u

🟢 Updating DNSLink
✔ testing.stauro.xyz now points to /ipfs/bafybeic5ddic5i25eoee2bhw4br4cug45xeemhtsyklbj3kld6a6gcjv5u
```