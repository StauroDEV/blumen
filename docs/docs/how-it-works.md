# How it works

Blumen combines multiple technologies to provide the most secure, flexible and resilient website deployment tool.

## Re-pinning

The primary feature is uploading and re-pinning to multiple decentralized storage providers.

Since content on IPFS and Swarm has deterministic immutable hashes, it is possible to seamlessly replicate content (in a form of files or a DAG) into as many copies as possible. The reason why you would want to replicate content is to provide a fallback in case the first provider fails or does not have certain chunks of the new website version, while it is able to serve pre-existing chunks.

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
    "Source": "Amino DHT",
    "AgentVersion": "kubo/0.36.0-dev/8c2c5009d-dirty"
  }
]
```

## ENS Updates

The forefront decentralized naming layer is ENS. It is an Ethereum-based alternative to DNS and it is possible to use ENS for serving websites. ENS has a special record type called [`contentHash`](https://docs.ens.domains/ensip/7). It contains an encoded hash which includes such information as protocol version, codec data and the content hash itself, usually a multiformats CID.

Blumen has multiple ways of integrating ENS, varying in security and UX properties:

|  Type | Name theft protection  | Access to other records | Multi Factor Authorization | Restricted access
|---|---|---|---|---|
| EOA | No 🚨 | No 🚨 | No | No |
| Proposer | Yes | Yes | Yes | No |
| Zodiac Roles | Yes | Yes | No | Yes |
