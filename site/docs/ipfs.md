# IPFS

Blumen supports a wide range of different IPFS providers. If you would like to integrate your provider, feel free to submit a pull request.

## Spec-compliant Pinning Service

- API Docs: https://ipfs.github.io/pinning-services-api-spec
- API token env variables: `BLUMEN_SPEC_TOKEN`, `BLUMEN_SPEC_URL`
- Supported methods: Pin

Obtain an opaque access token from the service. Populate your environment as such:

```
BLUMEN_SPEC_TOKEN=<access_token>
BLUMEN_SPEC_URL=https://pinning-service.example.com
```

## Filebase

- URL: https://filebase.com
- API Docs: https://docs.filebase.com/api-documentation/ipfs-pinning-service-api
- API token env variables: `BLUMEN_FILEBASE_TOKEN` for pinning (if not the first provider), additionally `BLUMEN_FILEBASE_BUCKET_NAME` for upload + pin.
- Supported methods: Upload, Pin, Status

`BLUMEN_FILEBASE_TOKEN` for upload + pin is obtained by encoding access key and access secret to base64. Access key and access secret could be found in the Filebase console.

![Filebase console](/filebase.png)

The easiest way to generate an S3 API token is using the `base64` command:

```sh
echo "$accessKey:$accessSecret" | base64
```

## Storacha

- URL: https://storacha.network
- API Docs: https://docs.storacha.network/how-to/upload
- API token env variables: `STORACHA_TOKEN`, `STORACHA_PROOF`
- Supported methods: Upload

First you have to install w3up cli:

::: code-group

```bash [npm]
npm i -g @storacha/cli
```

```bash [pnpm]
pnpm i -g @storacha/cli
```

```bash [bun]
bun i -g @storacha/cli
```

:::

Then you need to login to your Storacha account:

```
storacha login
```

Once log in is successful, you need to select your space. Grab the DID (the `did:key:...` string) from Storacha web console and run the following command:

```sh
storacha space use did:key:...
```

When both the account and the space are set up, you need to generate a unique private key. Later we'll need it to generate a proof (that gives us permit to upload files on Storacha).


```bash
storacha key create
```

Save this private key (which starts with `Mg..`) to an environment variable (`BLUMEN_STORACHA_TOKEN`).

You also need to create a delegation for the generated DID:

```sh
storacha delegation create <did_command_above> --can 'store/add' --can 'upload/add' --can 'space/blob/add' --can 'space/index/add' --base64 > proof.txt
```

Save the command output in a `BLUMEN_STORACHA_PROOF` environment variable or save it to a file (that should not be uploaded!) and then read from it like this:

```sh
BLUMEN_STORACHA_PROOF=`cat proof.txt`
```

## Pinata

- URL: https://pinata.cloud
- API Docs: https://docs.pinata.cloud/files/uploading-files
- API token env variables: `BLUMEN_PINATA_TOKEN`
- Supported methods: Pin, Status

Go to the dashboard page, then "API Keys" under "Developer" section. Click "New Key". An API key creation dialog should apppear. Select the checkboxes related to pinning. Click "Generate API Key".

![Pinata dashboard](/pinata.png)

Save the JWT token to the `BLUMEN_PINATA_TOKEN` environment variable.

## 4EVERLAND

- URL: https://www.4everland.org/
- API Docs: https://docs.4everland.org/
- API token env variables: `BLUMEN_4EVERLAND_TOKEN`
- Supported methods: Pin, Status

Open 4EVERLAND dashboard. Navigate to Storage > 4Ever Pin. Click "Access token". Copy the token and save it to the `BLUMEN_4EVERLAND_TOKEN` environment variable.

## QuickNode

- URL: https://quicknode.com
- API Docs: https://www.quicknode.com/docs/ipfs/Pinning/create-pinnedObject-by-CID
- API token env variables: `BLUMEN_QUICKNODE_TOKEN`
- Supported methods: Pin

Go to the dashboard and open the ["API Keys" page](https://dashboard.quicknode.com/api-keys). Click "Add API Key". In the "Applications" modal choose only "IPFS_REST". 

![Quicknode API key modal](/quicknode.png)

## Lighthouse

- URL: https://lighthouse.storage
- API Docs: https://docs.lighthouse.storage/api-docs/lighthouse-api
- API token env variables: `BLUMEN_LIGHTHOUSE_TOKEN`
- Supported methods: Pin

Go to "API Key", enter "Blumen" in the input box and click "Generate".