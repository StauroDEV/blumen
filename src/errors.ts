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
  name = 'UploadError'
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
