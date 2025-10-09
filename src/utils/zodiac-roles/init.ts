import { encodeData, getSelector } from 'ox/AbiFunction'
import type { Address } from 'ox/Address'
import { fromString, toHex } from 'ox/Bytes'
import { keccak256 } from 'ox/Hash'
import type { Hex } from 'ox/Hex'
import type { Provider } from 'ox/Provider'

const SET_CONTENT_HASH_SIG = getSelector('setContenthash(bytes32,bytes)')

const ENS_DEPLOYER_ROLE = keccak256(fromString('ENS_DEPLOYER'))

const assignRolesAbi = {
  inputs: [
    { internalType: 'address', name: 'module', type: 'address' },
    { internalType: 'bytes32[]', name: 'roleKeys', type: 'bytes32[]' },
    { internalType: 'bool[]', name: 'memberOf', type: 'bool[]' },
  ],
  name: 'assignRoles',
  outputs: [],
  stateMutability: 'nonpayable',
  type: 'function',
} as const

const allowFunctionAbi = {
  name: 'allowFunction',
  type: 'function',
  stateMutability: 'nonpayable',
  inputs: [
    { name: 'roleKey', type: 'bytes32' },
    { name: 'targetAddress', type: 'address' },
    { name: 'selector', type: 'bytes4' },
    { name: 'options', type: 'uint8' },
  ],
  outputs: [],
} as const

const scopeTargetAbi = {
  name: 'scopeTarget',
  type: 'function',
  stateMutability: 'nonpayable',
  inputs: [
    { name: 'roleKey', type: 'bytes32' },
    { name: 'targetAddress', type: 'address' },
  ],
  outputs: [],
} as const

export const createZodiacRoleData = async ({
  roleAddress,
}: {
  roleAddress: Address
}) => {
  return encodeData(assignRolesAbi, [
    roleAddress,
    [toHex(ENS_DEPLOYER_ROLE)],
    [true],
  ])
}

export const allowSetContentHashForRoleData = async ({
  resolverAddress,
}: {
  resolverAddress: Address
}) => {
  return encodeData(allowFunctionAbi, [
    toHex(ENS_DEPLOYER_ROLE),
    resolverAddress,
    SET_CONTENT_HASH_SIG,
    0, // CALL
  ])
}

export const setENSResolverAsScopeTarget = async ({
  resolverAddress,
}: {
  resolverAddress: Address
}) => {
  return encodeData(scopeTargetAbi, [toHex(ENS_DEPLOYER_ROLE), resolverAddress])
}
