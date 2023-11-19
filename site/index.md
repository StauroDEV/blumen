# Blumen

**Blumen** is a CLI and API library to deploy apps on the decentralized web using IPFS and Ethereum.

## Features

- **Multi-Provider Deployment**: Deploy your web app simultaneously on multiple IPFS providers, including [web3.storage](https://web3.storage) and [Gateway3](https://gateway3.io), ensuring redundancy and availability.
- **ENS Integration**: Seamlessly integrate with [ENS](https://ens.domains) to update your Content-Hash, making it easier for users to access your web app via ENS gateways.
- **Safe Integration**: Update your ENS Content-Hash using a multisig [Safe](https://safe.global) contract, adding an extra layer of security and decentralization.

## Installation

Node.js 16.8+ is required.

::: warning

Support for Node 16.8 will be removed in the future. Node 18 is recommended.

:::

::: code-group

```bash [npm]
npm i -g blumen
```

```bash [pnpm]
pnpm i -g blumen
```

```bash [bun]
bun i -g blumen
```

:::
