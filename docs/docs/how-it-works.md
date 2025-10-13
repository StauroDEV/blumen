# How it works

Blumen combines multiple technologies to provide the most secure, flexible and resilient website deployment tool. Blumen's design is modular and allows plugging multiple protocols together, depending on specific needs.

```mermaid
flowchart TD
  %% Nodes
  A["Website Files"] --> B{Package as}
  B --> C("CAR Archive (for IPFS)")
  B --> D("TAR Archive (for Swarm)")
  C --> E["Upload to IPFS"]
  D --> F["Upload to Swarm"]
  E --> G{Update Options}
  F --> G
  G --> H["DNSLink Update"]
  G --> I["ENS Update"]
  H --> H1["Uses Cloudflare API Token to update DNS record"]
  I --> J{ENS Update Method}
  J --> J1["EOA Transaction"]
  J --> J2["Safe Proposer Flow"]
  J --> J3["Safe Zodiac Role Flow"]

  %% Subgraphs for grouping
  subgraph PACKAGING
    B
    C
    D
  end

  subgraph UPLOAD
    E
    F
  end

  subgraph UPDATES
    G
    H
    H1
    I
    J
    J1
    J2
    J3
  end

  %% Classes for colors
  classDef storage fill:#f7f7ff,stroke:#999,stroke-width:1px;
  classDef upd     fill:#f0fff7,stroke:#999,stroke-width:1px;
  classDef act     fill:#fff7f0,stroke:#999,stroke-width:1px;

  class B,C,D,E,F storage;
  class G,H,I,J,J1,J2,J3 upd;
  class H1 act;

```

## Re-pinning

The primary feature is uploading and re-pinning to multiple decentralized storage providers.

Since content on IPFS and Swarm has deterministic immutable hashes, it is possible to seamlessly replicate content (in a form of files or a DAG) into as many copies as possible. The reason why you would want to replicate content is to provide a fallback in case the first provider fails or does not have certain chunks of the new website version, while it is able to serve pre-existing chunks.

Blumen scans the environment for provided API keys and tokens for storage providers, but is also possible to specify providers manually.

```sh
blumen deploy --providers Storacha,Lighthouse
```

```jsonc
// Example provider list for an IPFS-hosted website
[
  {
    "ID": "QmUA9D3H7HeCYsirB3KmPSvZh3dNXMZas6Lwgr4fv1HTTp",
    "Addrs": [
      "/dns/dag.w3s.link/tcp/443/https"
    ],
    "Source": "IPNI"
  },
  {
    "ID": "12D3KooWNy17sJ97GTcTYRsbrp9qA19EDNGMaRFAFuJfa9NX9woq",
    "Addrs": [
      "/ip4/51.79.228.206/udp/25594/quic-v1",
      "/ip4/51.79.228.206/tcp/4000"
    ],
    "Source": "Amino DHT"
  }
]
```

## ENS Updates

In order to not have to type a full IPFS hash to open a website, as well as improve SEO, UX and have a transparent on-chain history of website uodates, Blumen integrates with ENS. It is an Ethereum-based alternative to DNS and it is possible to use ENS for serving websites. ENS has a special record type called [`contentHash`](https://docs.ens.domains/ensip/7). It contains an encoded hash which includes such information as protocol version, codec data and the content hash itself, usually a multiformats CID.

Blumen has multiple ways of updating ENS, varying in security and UX properties:

|  Type | Name theft protection  | Access to other records | Multi Factor Authorization | Restricted access | Complexity
|---|---|---|---|---|--|
| EOA | No 🚨 | No 🚨 | No | No | Low
| Proposer | Yes | Yes | Yes | No | High
| Zodiac Roles | Yes | Yes | No | Yes | Medium

### EOA

A transaction is signed by a private key provided via `BLUMEN_PK` and is immediately pushed onchain. There are no barriers or restrctions on the account, so it is the least secure option. In case of a key compromise, it is possible to steal all the assets held by the account, steal the ENS name in case it is wrapped, and alter any other records on the name in case it is unwrapped. The only benefit of using an EOA is not requiring any custom setup.

In order to minimize the risks from using an EOA, it is recommended to unwrap the ENS name the website is hosted on and set the EOA as the manager of the name, while having a different account as an owner (for example a Safe multi-sig wallet).

### Proposer

An account derived from the private key provided via `BLUMEN_PK` is not used to update ENS directly. It is only able to submit transaction proposals to a Safe wallet through Safe Transaction Service. It is a centralized API run by Safe which allows enqueuing transactions while not being one of the owners. Proposers have zero access to the ENS name and therefore are not able to perform any theft or malicious actions. Each transaction proposed by Safe requires manual review and approval from owners.

While the Proposer flow is the safest and is the most secure, it is also the most complex in configuration and requires multiple manual steps.

#### Setup

1. Head over to the [Safe app](https://app.safe.global) and create a new wallet, if you don't have one yet.
2. Create a new Ethereum account that will be used for proposing transactions, save it's private key to `BLUMEN_PK`.
3. To add a proposer, go to the Safe app > Settings > Setup. Scroll down to "Proposers" and click "Add Proposer". You can add multiple proposers to your Safe, but only one can be used at a time.

![Proposer UI](/proposer.png)

### Zodiac Roles

A transaction is signed by a private key provided via `BLUMEN_PK` and is immediately pushed onchain. Unlike pure EOA, the account is restricted to only be able to update ENS name's `contentHash` record and does not manage the name. The name instead is managed by a Safe wallet.

#### Setup

1. Head over to the [Safe app](https://app.safe.global) and create a new wallet, if you don't one yet.

2. Install Safe Zodiac Roles Module through the [Zodiac app](https://app.safe.global/share/safe-app?appUrl=https%3A%2F%2Fzodiac.gnosisguild.org%2F)

3. Generate a JSON for a batch transaction setup via `blumen zodiac`:

```sh
blumen zodiac --safe 0x0Fd2cA6b1a52a1153dA0B31D02fD53854627D262 0x6aBD167a6a29Fd9aDcf4365Ed46C71c913B7c1B1

# blumen zodiac --safe 0x0Fd2cA6b1a52a1153dA0B31D02fD53854627D262 0x6aBD167a6a29Fd9aDcf4365Ed46C71c913B7c1B1 --verbose
# ⚠️ `BLUMEN_PK` environment variable not set.
# 🟢 Generating a Secp256k1 keypair
#    0xeb12099469558be35d53d606e1d5e69d0854c57ef6658e909325c5a0e6493415
# 🟢 Save the private key and do not share it to anyone
# 🟢 Created zodiac.json in current directory
# Open in a browser: https://app.safe.global/apps/open?safe=:0x0Fd2cA6b1a52a1153dA0B31D02fD53854627D262&appUrl=https%3A%2F%2Fapps-portal.safe.global%2Ftx-builder
# Upload zodiac.json in the UI
```

This will create a `zodiac.json` in a current directory. If `BLUMEN_PK` is not specified, an Ethereum Account will be generated on the spot.

4. Head over to the Safe [transaction builder](https://app.safe.global/apps/open?appUrl=https%3A%2F%2Fapps-portal.safe.global%2Ftx-builder) page.

5. Drag and drop the JSON file and confirm transaction execution.
