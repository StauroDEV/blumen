export const chainIdToSafeApiUrl = (chainId: 1 | 5) => {
  switch (chainId) {
    case 1:
      return 'https://safe-transaction-mainnet.safe.global'
    case 5:
      return 'https://safe-transaction-goerli.safe.global'
    default:
      throw new Error('Unsupported chain')
  }
}