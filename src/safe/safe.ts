import { Address } from 'viem'
import { Chain } from '../types.js'
import { proposeTransaction } from './proposeTransaction.js'
import { ProposeTransactionProps } from './types.js'

export const initializeSafe = ({
  chain,
  safeAddress,
}: {
  chain: Chain
  safeAddress: Address
}) => {
  return {
    proposeTransaction: (
      args: Omit<ProposeTransactionProps, 'chainId' | 'safeAddress'>,
    ) =>
      proposeTransaction({
        chainId: chain === 'mainnet' ? 1 : 4,
        safeAddress,
        ...args,
      }),
  }
}
