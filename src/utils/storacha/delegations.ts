import * as ucanto from '@ucanto/core'
import type * as Ucanto from '@ucanto/interface'
import { canDelegateAbility } from './capabilities.js'
import type { ResourceQuery } from './types.js'

export function isExpired(delegation: Ucanto.Delegation): boolean {
  return (
    delegation.expiration === undefined ||
    delegation.expiration <= Math.floor(Date.now() / 1000)
  )
}

export function isTooEarly(delegation: Ucanto.Delegation): boolean {
  return delegation.notBefore
    ? delegation.notBefore > Math.floor(Date.now() / 1000)
    : false
}

const matchResource = (resource: string, query: ResourceQuery): boolean => {
  if (typeof query === 'string') return query === 'ucan:*' || resource === query
  return query.test(resource)
}

export function canDelegateCapability(
  delegation: Ucanto.Delegation,
  capability: Ucanto.Capability,
): boolean {
  const allowsCapabilities = ucanto.Delegation.allows(delegation)
  for (const [uri, abilities] of Object.entries(allowsCapabilities)) {
    if (matchResource(uri, capability.with)) {
      for (const can of Object.keys(abilities) as Ucanto.Ability[])
        if (canDelegateAbility(can, capability.can)) return true
    }
  }
  return false
}
