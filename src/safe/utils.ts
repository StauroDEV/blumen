import { isAddress } from 'viem/utils'
import { Eip3770Address } from './types.js'

const networks = [
  { chainId: 1, shortName: 'eth' },
  { chainId: 5, shortName: 'gor' },
]

function parseEip3770Address(fullAddress: string): Eip3770Address {
  const parts = fullAddress.split(':')
  const address = parts.length > 1 ? parts[1] : parts[0]
  const prefix = parts.length > 1 ? parts[0] : ''
  return { prefix, address }
}

function validateEthereumAddress(address: string): void {
  const isValidAddress = isAddress(address)
  if (!isValidAddress) {
    throw new Error(`Invalid Ethereum address ${address}`)
  }
}

function isValidEip3770NetworkPrefix(prefix: string): boolean {
  return networks.some(({ shortName }) => shortName === prefix)
}

function getEip3770NetworkPrefixFromChainId(chainId: number): string {
  const network = networks.find((network) => chainId === network.chainId)
  if (!network) {
    throw new Error('No network prefix supported for the current chainId')
  }
  return network.shortName
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
  fullAddress,
  chainId,
}: {
  fullAddress: string
  chainId: number
}): Promise<Eip3770Address> {
  return validateEip3770Address(fullAddress, chainId)
}
