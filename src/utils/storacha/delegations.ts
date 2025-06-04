import * as ucanto from '@ucanto/core'
import type * as Ucanto from '@ucanto/interface'
import { canDelegateAbility } from '@web3-storage/capabilities/utils';
import type { ResourceQuery } from './types.js';

export function isExpired(delegation: Ucanto.Delegation) {
  if (delegation.expiration === undefined ||
    delegation.expiration <= Math.floor(Date.now() / 1000)) {
    return true;
  }
  return false;
}


export function isTooEarly(delegation: Ucanto.Delegation) {
  if (!delegation.notBefore) {
    return false;
  }
  return delegation.notBefore > Math.floor(Date.now() / 1000);
}

const matchResource = (resource: string, query: ResourceQuery) => {
  if (query === 'ucan:*') {
    return true
  } else if (typeof query === 'string') {
    return resource === query
  } else {
    return query.test(resource)
  }
}

export function canDelegateCapability(delegation: Ucanto.Delegation, capability: Ucanto.Capability) {
  const allowsCapabilities = ucanto.Delegation.allows(delegation)
  for (const [uri, abilities] of Object.entries(allowsCapabilities)) {
    if (matchResource(/** @type {API.Resource} */(uri), capability.with)) {
      const cans = (Object.keys(abilities)) as Ucanto.Ability[]

      for (const can of cans) {
        if (canDelegateAbility(can, capability.can)) {
          return true
        }
      }
    }
  }
  return false
}