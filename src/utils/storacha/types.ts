import type {
  AssertLocation,
  SpaceBlobAdd,
  SpaceBlobAddFailure,
  SpaceBlobAddSuccess,
  SpaceBlobGet,
  SpaceBlobGetFailure,
  SpaceBlobGetSuccess,
  SpaceBlobList,
  SpaceBlobListFailure,
  SpaceBlobListSuccess,
  SpaceBlobRemove,
  SpaceBlobRemoveFailure,
  SpaceBlobRemoveSuccess,
  SpaceBlobReplicate,
  SpaceBlobReplicateFailure,
  SpaceBlobReplicateSuccess,
  SpaceIndexAdd,
  SpaceIndexAddFailure,
  SpaceIndexAddSuccess,
  UCANConclude,
  UCANConcludeFailure,
  UCANConcludeSuccess,
  UploadAdd,
  UploadAddSuccess,
  UploadGet,
  UploadGetFailure,
  UploadGetSuccess,
  UploadList,
  UploadListSuccess,
  UploadRemove,
  UploadRemoveSuccess,
  UsageReport,
  UsageReportFailure,
  UsageReportSuccess,
} from '@storacha/capabilities/types'
import type { StorefrontService } from '@storacha/filecoin-client/storefront'
import type * as Client from '@ucanto/client'
import type {
  DID,
  Failure,
  MultihashDigest,
  Proof,
  Signer,
} from '@ucanto/interface'
import type { CAR } from '@ucanto/transport'
import type { Version } from 'multiformats'

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

export type Position = [offset: number, length: number]

export interface InvocationConfig {
  /**
   * Signing authority that is issuing the UCAN invocation(s).
   */
  issuer: Signer
  /**
   * The resource the invocation applies to.
   */
  with: DID
  /**
   * Proof(s) the issuer has the capability to perform the action.
   */
  proofs: Proof[]
}

export type SliceDigest = MultihashDigest

export interface Service extends StorefrontService {
  ucan: {
    conclude: Client.ServiceMethod<
      UCANConclude,
      UCANConcludeSuccess,
      UCANConcludeFailure
    >
  }
  space: {
    blob: {
      add: Client.ServiceMethod<
        SpaceBlobAdd,
        SpaceBlobAddSuccess,
        SpaceBlobAddFailure
      >
      remove: Client.ServiceMethod<
        SpaceBlobRemove,
        SpaceBlobRemoveSuccess,
        SpaceBlobRemoveFailure
      >
      list: Client.ServiceMethod<
        SpaceBlobList,
        SpaceBlobListSuccess,
        SpaceBlobListFailure
      >
      get: {
        0: {
          1: Client.ServiceMethod<
            SpaceBlobGet,
            SpaceBlobGetSuccess,
            SpaceBlobGetFailure
          >
        }
      }
      replicate: Client.ServiceMethod<
        SpaceBlobReplicate,
        SpaceBlobReplicateSuccess,
        SpaceBlobReplicateFailure
      >
    }
    index: {
      add: Client.ServiceMethod<
        SpaceIndexAdd,
        SpaceIndexAddSuccess,
        SpaceIndexAddFailure
      >
    }
  }
  upload: {
    add: Client.ServiceMethod<UploadAdd, UploadAddSuccess, Failure>
    get: Client.ServiceMethod<UploadGet, UploadGetSuccess, UploadGetFailure>
    remove: Client.ServiceMethod<UploadRemove, UploadRemoveSuccess, Failure>
    list: Client.ServiceMethod<UploadList, UploadListSuccess, Failure>
  }
  usage: {
    report: Client.ServiceMethod<
      UsageReport,
      UsageReportSuccess,
      UsageReportFailure
    >
  }
}
export interface BlobAddOk {
  site: Client.Delegation<[AssertLocation]>
}

/**
 * Any IPLD link.
 */
export type AnyLink = Client.Link<unknown, number, number, Version>

export type CARLink = Client.Link<unknown, typeof CAR.codec.code>
