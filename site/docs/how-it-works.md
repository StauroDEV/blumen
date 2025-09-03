# How it works

Blumen stands out from other decentralized web deployment tools because it adds an extra factor of security to the deployment pipeline by utilizing [Safe](https://safe.global). Instead of relying on a single private key to authorize ENS updates or resorting to slow and insecure options such as IPNS, Blumen proposes a transaction to a Safe multisig via a separate Ethereum account (called "proposer"), while also requiring approval and execution by Safe owners before the ENS website content is updated. This method protects from CI/CD key leaks and access compromise.

Such approach is superior to previous setups, since it does not compromise convenience, decentralization or complexity. The only central factor becomes the Safe transaction service which only serves as a queue for transaction proposals.

## With IPFS

```mermaid
sequenceDiagram
    participant Dev as blumen deploy
    participant IPFS as IPFS Providers
    participant SafeTx as Safe Transaction Service
    participant Owners as Safe Owners
    participant ENS as ENS Name
    participant Gateway as ENS Gateway<br/>(.eth.limo / .eth.link)

    Dev->>IPFS: Upload website content (CAR → CID)
    Dev->>SafeTx: Propose transaction to update ENS contenthash

    Note over SafeTx: Transaction stored<br/>in Safe service queue

    Owners->>SafeTx: Approve transaction<br/>(until threshold reached)
    Owners->>SafeTx: Execute transaction

    SafeTx->>ENS: Update ENS resolver<br/>with new IPFS CID
    ENS-->>Gateway: Resolve ENS → IPFS CID
```

## With Swarm

```mermaid
sequenceDiagram
    participant Dev as blumen deploy
    participant Swarm as Swarm Nodes
    participant SafeTx as Safe Transaction Service
    participant Owners as Safe Owners
    participant ENS as ENS Name
    participant Gateway as ENS Gateway<br/>(.eth.limo / .eth.link)

    Dev->>Swarm: Upload website content (manifest → BZZ hash)
    Dev->>SafeTx: Propose transaction to update ENS contenthash

    Note over SafeTx: Transaction stored<br/>in Safe service queue

    Owners->>SafeTx: Approve transaction<br/>(until threshold reached)
    Owners->>SafeTx: Execute transaction

    SafeTx->>ENS: Update ENS resolver<br/>with new Swarm hash
    ENS-->>Gateway: Resolve ENS → Swarm hash
```