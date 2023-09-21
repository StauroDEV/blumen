import type { Address, BlockTag, PublicClient } from 'viem'

export async function isContractDeployed({
  provider,
  address,
  blockTag,
}: {
  provider: PublicClient
  address: Address
  blockTag?: BlockTag
}): Promise<boolean> {
  const contractCode = await provider.getBytecode({ blockTag, address })
  return contractCode !== undefined
}
