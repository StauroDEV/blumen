import { encodeData, getSelector } from 'ox/AbiFunction'
import type { Address } from 'ox/Address'
import { fromString, toHex } from 'ox/Bytes'
import { keccak256 } from 'ox/Hash'
import type { Hex } from 'ox/Hex'
import type { Provider } from 'ox/Provider'
import { sendTransaction, simulateTransaction } from '../tx.js'

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

export const createZodiacRole = async ({
  rolesModAddress,
  provider,
  privateKey,
  from,
  deployerAddress,
}: {
  rolesModAddress: Address
  deployerAddress: Address
  provider: Provider
  privateKey: Hex
  from: Address
}) => {
  const data = encodeData(assignRolesAbi, [
    deployerAddress,
    [toHex(ENS_DEPLOYER_ROLE)],
    [true],
  ])

  await simulateTransaction({
    provider,
    to: rolesModAddress,
    data,
    abi: assignRolesAbi,
    from,
  })

  await sendTransaction({
    to: rolesModAddress,
    provider,
    chainId: 1,
    from,
    privateKey,
    data,
  })
}

export const allowSetContentHashForRole = async ({
  provider,
  resolverAddress,
  from,
  rolesModAddress,
  privateKey,
}: {
  rolesModAddress: Address
  provider: Provider
  resolverAddress: Address
  from: Hex
  privateKey: Hex
}) => {
  const data = encodeData(allowFunctionAbi, [
    toHex(ENS_DEPLOYER_ROLE),
    resolverAddress,
    SET_CONTENT_HASH_SIG,
    0, // CALL
  ])

  await simulateTransaction({
    provider,
    to: rolesModAddress,
    data,
    from,
    abi: allowFunctionAbi,
  })

  await sendTransaction({
    to: rolesModAddress,
    provider,
    chainId: 1,
    from,
    privateKey,
    data,
  })
}
