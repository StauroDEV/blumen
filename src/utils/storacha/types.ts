import type * as Client from '@ucanto/client'

/**
 * Agent metadata used to describe an agent ("audience")
 * with a more human and UI friendly data
 */
export interface AgentMeta {
  name: string
  description?: string
  url?: URL
  image?: URL
  type: 'device' | 'app' | 'service'
}

/**
 * Delegation metadata
 */
export interface DelegationMeta {
  /**
   * Audience metadata to be easier to build UIs with human readable data
   * Normally used with delegations issued to third parties or other devices.
   */
  audience?: AgentMeta
}

export interface Driver<T> {
  /**
   * Open driver
   */
  open: () => Promise<void>
  /**
   * Clean up and close driver
   */
  close: () => Promise<void>
  /**
   * Persist data to the driver's backend
   */
  save: (data: T) => Promise<void>
  /**
   * Loads data from the driver's backend
   */
  load: () => Promise<T | undefined>
  /**
   * Clean all the data in the driver's backend
   */
  reset: () => Promise<void>
}

/**
 * Space metadata
 */
export interface SpaceMeta {
  /**
   * Human readable name for the space
   */
  name: string
}

export type ResourceQuery = Client.Resource | RegExp