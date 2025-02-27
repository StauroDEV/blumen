# Supported providers

We support a wide range of different IPFS providers. If you would like to integrate your provider, feel free to submit a pull request.

## Filebase

- URL: https://filebase.com
- API Docs: https://docs.filebase.com/api-documentation/ipfs-pinning-service-api
- API token env variables: `BLUMEN_FILEBASE_TOKEN` for pinning (if not the first provider), additionally `BLUMEN_FILEBASE_BUCKET_NAME` for upload + pin.
- Supported methods: Upload, Pin, Status

`BLUMEN_FILEBASE_TOKEN` for upload + pin is obtained by encoding access key and access secret to base64. Access key and access secret could be found in the Filebase console.

![Filebase console](/filebase.png)

The easiest way to generate an S3 API token is using the `base64` command:

```sh
echo "accessKey:accessSecret" | base64
```

## Storacha

- URL: https://storacha.network
- API Docs: https://docs.storacha.network/how-to/upload
- API token env variables: `STORACHA_TOKEN`, `STORACHA_PROOF`
- Supported methods: Upload

First you have to install w3up cli:

::: code-group

```bash [npm]
npm i -g @web3-storage/w3cli
```

```bash [pnpm]
pnpm i -g @web3-storage/w3cli
```

```bash [bun]
bun i -g @web3-storage/w3cli
```

:::

Then you need to login to your Storacha account:

```
w3 login <your@mail.com>
```

Once log in is successful, you need to select your space. Grab the DID (the `did:key:...` string) from Storacha web console and run the following command:

```sh
w3 space use did:key:...
```

When both the account and the space are set up, you need to generate a unique private key. Later we'll need it to generate a proof (that gives us permit to upload files on Storacha).

::: code-group

```bash [npm]
npx ucan-key ed
```

```bash [pnpm]
pnpx ucan-key ed
```

```bash [bun]
bunx ucan-key ed
```

:::

Save this private key (which starts with `Mg..`) to an environment variable (`BLUMEN_STORACHA_TOKEN`).

You also need to create a delegation for the generated DID:

```sh
w3 delegation create <did_from_ucan-key_command_above> --can 'store/add' --can 'upload/add' --can 'space/blob/add' --can 'space/index/add' | base64
```

Save the command output in a `BLUMEN_STORACHA_PROOF` environment variable or save it to a file (that should not be uploaded!) and then read from it like this:

```sh
BLUMEN_STORACHA_PROOF=`cat proof.txt`
```
