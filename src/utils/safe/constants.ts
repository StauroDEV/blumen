/* eslint-disable @stylistic/max-len */

export const getTransactionHash = {
  name: 'getTransactionHash',
  type: 'function',
  stateMutability: 'view',
  inputs: [
    {
      type: 'address',
      name: 'to',
    },
    {
      type: 'uint256',
      name: 'value',
    },
    {
      type: 'bytes',
      name: 'data',
    },
    {
      type: 'uint8',
      name: 'operation',
    },
    {
      type: 'uint256',
      name: 'safeTxGas',
    },
    {
      type: 'uint256',
      name: 'baseGas',
    },
    {
      type: 'uint256',
      name: 'gasPrice',
    },
    {
      type: 'address',
      name: 'gasToken',
    },
    {
      type: 'address',
      name: 'refundReceiver',
    },
    {
      type: 'uint256',
      name: '_nonce',
    },
  ],
  outputs: [
    {
      type: 'bytes32',
    },
  ],
  hash: '0xd8d11f786b243022ceb2ed0c945f49b175419eab6a0c57d843e579bf5e89d9fb',
} as const

export const getNonce = {
  name: 'nonce',
  type: 'function',
  stateMutability: 'view',
  inputs: [],
  outputs: [
    {
      type: 'uint256',
    },
  ],
  hash: '0xaffed0e0ba94adda3772e73093f9f42c54ccf7ebf1e7dabc728520a58f80bdf5',
} as const
