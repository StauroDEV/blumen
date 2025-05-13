/* eslint-disable @stylistic/max-len */

import { from } from 'ox/AbiFunction'

export const simulateTxAccessorAddress =
  '0x59AD6735bCd8152B84860Cb256dD9e96b85F69Da'

export const safeSingletonAddress = '0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552'

export const simulateAndRevert = from(
  'function simulateAndRevert(address targetContract, bytes memory calldataPayload)',
)
export const getTransactionHash = from(
  'function getTransactionHash(address to, uint256 value, bytes calldata data, uint8 operation, uint256 safeTxGas, uint256 baseGas, uint256 gasPrice, address gasToken, address refundReceiver, uint256 _nonce) public view returns (bytes32)',
)
export const execTransaction = from(
  'function execTransaction(address to, uint256 value, bytes calldata data, uint8 operation, uint256 safeTxGas, uint256 baseGas, uint256 gasPrice, address gasToken, address refundReceiver, bytes memory signatures) public payable returns (bool)',
)
export const getNonce = from('function nonce() public view returns (uint256)')
export const getThreshold = from(
  'function getThreshold() public view returns (uint256)',
)
export const getOwners = from(
  'function getOwners() public view returns (address[])',
)
