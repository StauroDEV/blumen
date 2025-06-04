/* eslint-disable @stylistic/max-len */

import { from } from 'ox/AbiFunction'

export const getTransactionHash = from(
  'function getTransactionHash(address to, uint256 value, bytes calldata data, uint8 operation, uint256 safeTxGas, uint256 baseGas, uint256 gasPrice, address gasToken, address refundReceiver, uint256 _nonce) public view returns (bytes32)',
)

export const getNonce = from('function nonce() public view returns (uint256)')
