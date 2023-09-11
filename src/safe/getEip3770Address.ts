import { isAddress } from 'viem/utils'
import { Eip3770Address } from './types.js'
import { networks } from './chains.js'

type ValidInputTypes = Uint8Array | bigint | string | number | boolean

const isHexStrict = (hex: ValidInputTypes) =>
  typeof hex === 'string' && /^((-)?0x[0-9a-f]+|(0x))$/i.test(hex)

function parseEip3770Address(fullAddress: string): Eip3770Address {
  const parts = fullAddress.split(':')
  const address = parts.length > 1 ? parts[1] : parts[0]
  const prefix = parts.length > 1 ? parts[0] : ''
  return { prefix, address }
}

function getEip3770NetworkPrefixFromChainId(chainId: number): string {
  const network = networks.find((network) => chainId === network.chainId)
  if (!network) {
    throw new Error('No network prefix supported for the current chainId')
  }
  return network.shortName
}

function validateEthereumAddress(address: string): void {
  const isValidAddress = isHexStrict(address) && isAddress(address)
  if (!isValidAddress) {
    throw new Error(`Invalid Ethereum address ${address}`)
  }
}

function isValidEip3770NetworkPrefix(prefix: string): boolean {
  return networks.some(({ shortName }) => shortName === prefix)
}

function validateEip3770NetworkPrefix(
  prefix: string,
  currentChainId: number,
): void {
  const isCurrentNetworkPrefix =
    prefix === getEip3770NetworkPrefixFromChainId(currentChainId)
  if (!isValidEip3770NetworkPrefix(prefix) || !isCurrentNetworkPrefix) {
    throw new Error('The network prefix must match the current network')
  }
}

function validateEip3770Address(
  fullAddress: string,
  currentChainId: number,
): Eip3770Address {
  const { address, prefix } = parseEip3770Address(fullAddress)
  validateEthereumAddress(address)
  if (prefix) {
    validateEip3770NetworkPrefix(prefix, currentChainId)
  }
  return { address, prefix }
}

export async function getEip3770Address({
  chainId,
  fullAddress,
}: {
  chainId: number
  fullAddress: string
}): Promise<Eip3770Address> {
  return validateEip3770Address(fullAddress, chainId)
}
