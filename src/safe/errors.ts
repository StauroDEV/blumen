export class InvalidTxHashError extends Error {
  name = 'InvalidTxHashError'
  constructor(hash: string) {
    super(`Invalid tx hash: ${hash}`)
  }
}

export class InvalidSafeAddress extends Error {
  name = 'InvalidSafeAddress'
  constructor(address: string) {
    super(`Invalid safe address: ${address}`)
  }
}
