interface NetworkShortName {
  shortName: string
  chainId: number
}

export const networks: NetworkShortName[] = [
  { chainId: 1, shortName: 'eth' },
  { chainId: 5, shortName: 'gor' },
]
