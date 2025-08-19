import type { API } from '@ucanto/core'

function parseAbility(ability: API.Ability) {
  const [namespace, ...segments] = ability.split('/')
  return { namespace, segments }
}

export function canDelegateAbility(parent: API.Ability, child: API.Ability) {
  const parsedParent = parseAbility(parent)
  const parsedChild = parseAbility(child)
  // Parent is wildcard
  if (parsedParent.namespace === '*' && parsedParent.segments.length === 0)
    return true
  // Child is wild card so it can not be delegated from anything
  if (parsedChild.namespace === '*' && parsedChild.segments.length === 0)
    return false
  // namespaces don't match
  if (parsedParent.namespace !== parsedChild.namespace) return false
  // given that namespaces match and parent first segment is wildcard
  if (parsedParent.segments[0] === '*') return true
  // Array equality
  if (parsedParent.segments.length !== parsedChild.segments.length) return false
  // all segments must match
  return parsedParent.segments.reduce(
    (acc, v, i) => acc && parsedChild.segments[i] === v,
    true,
  )
}
