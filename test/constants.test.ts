import { describe, expect, it } from 'bun:test'
import { chains } from '../src/constants'

describe('constants', () => {
  it('chains snapshot matches', () => {
    expect(chains).toMatchInlineSnapshot(`
      {
        "mainnet": {
          "blockExplorers": {
            "default": {
              "apiUrl": "https://api.etherscan.io/api",
              "name": "Etherscan",
              "url": "https://etherscan.io",
            },
          },
          "id": 1,
          "name": "Ethereum",
          "nativeCurrency": {
            "decimals": 18,
            "name": "Ether",
            "symbol": "ETH",
          },
        },
        "sepolia": {
          "blockExplorers": {
            "default": {
              "apiUrl": "https://api-sepolia.etherscan.io/api",
              "name": "Etherscan",
              "url": "https://sepolia.etherscan.io",
            },
          },
          "id": 11155111,
          "name": "Sepolia",
          "nativeCurrency": {
            "decimals": 18,
            "name": "Sepolia Ether",
            "symbol": "ETH",
          },
        },
      }
    `)
  })
})
