import * as DID from '@ipld/dag-ucan/did'

export const uploadServiceURL = new URL('https://up.storacha.network')
export const uploadServicePrincipal = DID.parse('did:web:up.storacha.network')
export const receiptsEndpoint = 'https://up.storacha.network/receipt/'

export const REQUEST_RETRIES = 3
