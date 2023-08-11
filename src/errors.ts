export class UploadNotSupportedError extends Error {
  name = 'UploadNotSupportedError'
  providerName: string
  constructor(providerName: string) {
    super(`Provider ${providerName} upload API is not supported yet.`)
    this.providerName = providerName
  }
}

export class PinningNotSupportedError extends Error {
  name = 'PinningNotSupportedError'
  providerName: string
  constructor(providerName: string) {
    super(`Provider ${providerName} pinning API is not supported yet.`)
    this.providerName = providerName
  }
}

export class UnknownProviderError extends Error {
  name = 'UnknownProviderError'
  providerName: string
  constructor(providerName: string) {
    super(`Unknown provider ${providerName}.`)
    this.providerName = providerName
  }
}

export class GatewayError extends Error {
  name = 'GatewayError'
  providerName: string
  constructor(providerName: string, status: number, statusText: string) {
    super(`${providerName}: ${status} ${statusText}.`)
    this.providerName = providerName
  }
}

export class DeployError extends Error {
  name = 'DeployError'
  providerName: string
  constructor(providerName: string, originalMessage: string) {
    super(`Failed to deploy on ${providerName}: ${originalMessage}`)
    this.providerName = providerName
  }
}

export class NoProvidersError extends Error {
  name = 'NoProvidersError'
  constructor() {
    super('No providers detected.')
  }
}

export class MissingKeyError extends Error {
  name = 'MissingKeyError'
  constructor(key: string) {
    super(`BLUMEN_${key} is missing.`)
  }
}

export class InvalidCIDError extends Error {
  name = 'InvalidCIDError'
  constructor(cid: string) {
    super(`${cid} is invalid IPFS CID.`)
  }
}

export class MissingDirectoryError extends Error {
  name = 'MissingDirectory'
  constructor(dir: string) {
    super(`Directory ${dir} is missing.`)
  }
}
