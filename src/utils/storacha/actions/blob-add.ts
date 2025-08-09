import * as BlobCapabilities from '@storacha/capabilities/blob'
import * as HTTPCapabilities from '@storacha/capabilities/http'
import * as SpaceBlobCapabilities from '@storacha/capabilities/space/blob'
import type {
  BlobAccept,
  BlobAcceptFailure,
  BlobAcceptSuccess,
  SpaceBlobAddSuccess,
} from '@storacha/capabilities/types'
import * as UCAN from '@storacha/capabilities/ucan'
import { SpaceDID } from '@storacha/capabilities/utils'
import * as W3sBlobCapabilities from '@storacha/capabilities/web3.storage/blob'
import { Delegation, Receipt } from '@ucanto/core'
import type * as Interface from '@ucanto/interface'
import type { Invocation } from '@ucanto/interface'
import { ed25519 } from '@ucanto/principal'
import type { MultihashDigest } from 'multiformats'
import retry, { AbortError } from 'p-retry'
import { connection } from '../agent.js'
import { REQUEST_RETRIES, uploadServicePrincipal } from '../constants.js'
import { poll } from '../receipts.js'
import type * as API from '../types.js'

function getConcludeReceipt<Ok extends object, Err extends object>(
  concludeFx: Invocation,
): Interface.Receipt<Ok, Err> {
  const receiptBlocks = new Map<string, Interface.Transport.Block>()
  for (const block of concludeFx.iterateIPLDBlocks()) {
    receiptBlocks.set(`${block.cid}`, block)
  }
  return Receipt.view({
    // @ts-expect-error object of type unknown
    root: concludeFx.capabilities[0].nb.receipt,
    blocks: receiptBlocks,
  })
}

function parseBlobAddReceiptNext<
  Ok extends SpaceBlobAddSuccess,
  Err extends object,
>(receipt: Interface.Receipt<Ok, Err>) {
  const forkInvocations = receipt.fx.fork as Invocation[]
  const allocateTask =
    forkInvocations.find(
      (fork) => fork.capabilities[0].can === BlobCapabilities.allocate.can,
    ) ??
    forkInvocations.find(
      (fork) => fork.capabilities[0].can === W3sBlobCapabilities.allocate.can,
    )
  const concludefxs = forkInvocations.filter(
    (fork) => fork.capabilities[0].can === UCAN.conclude.can,
  )
  const putTask = forkInvocations.find(
    (fork) => fork.capabilities[0].can === HTTPCapabilities.put.can,
  )

  const acceptTask = (forkInvocations.find(
    (fork) => fork.capabilities[0].can === BlobCapabilities.accept.can,
  ) ??
    forkInvocations.find(
      (fork) => fork.capabilities[0].can === W3sBlobCapabilities.accept.can,
    )) as Interface.Invocation<BlobAccept> | undefined

  if (!allocateTask || !concludefxs.length || !putTask || !acceptTask) {
    throw new Error('mandatory effects not received')
  }

  // Decode receipts available
  const nextReceipts = concludefxs.map((fx) => getConcludeReceipt(fx))

  const allocateReceipt = nextReceipts.find((receipt) =>
    receipt.ran.link().equals(allocateTask.cid),
  )
  const putReceipt = nextReceipts.find((receipt) =>
    receipt.ran.link().equals(putTask.cid),
  )

  const acceptReceipt = nextReceipts.find((receipt) =>
    receipt.ran.link().equals(acceptTask.cid),
  ) as Interface.Receipt<BlobAcceptSuccess, BlobAcceptFailure> | undefined

  if (!allocateReceipt) {
    throw new Error('mandatory effects not received')
  }

  return {
    allocate: {
      task: allocateTask,
      receipt: allocateReceipt,
    },
    put: {
      task: putTask,
      receipt: putReceipt,
    },
    accept: {
      task: acceptTask,
      receipt: acceptReceipt,
    },
  }
}

function createConcludeInvocation<ID extends Interface.DID>(
  id: Interface.Signer,
  serviceDid: Interface.Principal<ID>,
  receipt: Interface.Receipt,
) {
  const receiptBlocks: Interface.Transport.Block[] = []
  const receiptCids: Interface.Link<unknown, number, number, 1>[] = []
  for (const block of receipt.iterateIPLDBlocks()) {
    receiptBlocks.push(block)
    receiptCids.push(block.cid)
  }
  const concludeAllocatefx = UCAN.conclude.invoke({
    issuer: id,
    audience: serviceDid,
    with: id.toDIDKey(),
    nb: {
      receipt: receipt.link(),
    },
    expiration: Infinity,
    facts: [
      {
        ...receiptCids,
      },
    ],
  })
  for (const block of receiptBlocks) {
    concludeAllocatefx.attach(block)
  }

  return concludeAllocatefx
}

/**
 * Store a blob to the service. The issuer needs the `blob/add`
 * delegated capability.
 *
 * Required delegated capability proofs: `blob/add`
 */
export async function add(
  { issuer, with: resource, proofs }: API.InvocationConfig,
  digest: MultihashDigest,
  data: Blob | Uint8Array,
) {
  /* c8 ignore next 2 */
  const bytes =
    data instanceof Uint8Array ? data : new Uint8Array(await data.arrayBuffer())
  const size = bytes.length

  const result = await retry(
    async () => {
      return await SpaceBlobCapabilities.add
        .invoke({
          issuer,
          audience: uploadServicePrincipal,
          with: SpaceDID.from(resource),
          nb: input(digest, size),
          proofs,
        })
        .execute(connection)
    },
    {
      onFailedAttempt: console.warn,
      retries: REQUEST_RETRIES,
    },
  )

  if (!result.out.ok) {
    throw new Error(`failed ${SpaceBlobCapabilities.add.can} invocation`, {
      cause: result.out.error,
    })
  }

  const nextTasks = parseBlobAddReceiptNext(result)

  const { receipt: allocateReceipt } = nextTasks.allocate

  if (!allocateReceipt.out.ok) {
    throw new Error(`failed ${SpaceBlobCapabilities.add.can} invocation`, {
      cause: allocateReceipt.out.error,
    })
  }

  const { address } = allocateReceipt.out.ok as { address: Request }
  if (address) {
    await retry(
      async () => {
        const res = await fetch(address.url, {
          method: 'PUT',
          mode: 'cors',
          body: bytes,
          headers: address.headers,
          // @ts-expect-error - this is needed by recent versions of node - see https://github.com/bluesky-social/atproto/pull/470 for more info
          duplex: 'half',
        })
        // do not retry client errors
        if (res.status >= 400 && res.status < 500) {
          throw new AbortError(`upload failed: ${res.status}`)
        }
        if (!res.ok) {
          throw new Error(`upload failed: ${res.status}`)
        }
        await res.arrayBuffer()
      },
      {
        retries: REQUEST_RETRIES,
      },
    )
  }

  // Invoke `conclude` with `http/put` receipt
  let { receipt: httpPutReceipt } = nextTasks.put
  if (!httpPutReceipt?.out.ok) {
    const derivedSigner = ed25519.from(
      nextTasks.put.task.facts[0].keys as Interface.SignerArchive<
        Interface.DID,
        typeof ed25519.signatureCode
      >,
    )
    httpPutReceipt = await Receipt.issue({
      issuer: derivedSigner,
      ran: nextTasks.put.task.cid,
      result: { ok: {} },
    })
    const httpPutConcludeInvocation = createConcludeInvocation(
      issuer,
      uploadServicePrincipal,
      httpPutReceipt,
    )
    const ucanConclude = await httpPutConcludeInvocation.execute(connection)
    if (!ucanConclude.out.ok) {
      throw new Error(
        `failed ${UCAN.conclude.can} for ${HTTPCapabilities.put.can} invocation`,
        {
          cause: ucanConclude.out.error,
        },
      )
    }
  }

  // Ensure the blob has been accepted
  let { receipt: acceptReceipt } = nextTasks.accept

  if (!acceptReceipt || !acceptReceipt.out.ok) {
    acceptReceipt = (await poll(
      nextTasks.accept.task.link(),
    )) as unknown as Interface.Receipt<BlobAcceptSuccess, BlobAcceptFailure>
    if (acceptReceipt?.out.error) {
      throw new Error(`${BlobCapabilities.accept.can} failure`, {
        cause: acceptReceipt.out.error,
      })
    }
  }

  if (!acceptReceipt) throw new Error('No accept receipt found')

  const blocks = new Map(
    [...acceptReceipt.iterateIPLDBlocks()].map((block) => [
      `${block.cid}`,
      block,
    ]),
  )

  const site = Delegation.view({
    root: acceptReceipt.out.ok?.site as Interface.UCANLink,
    blocks,
  })

  return { site }
}

/** Returns the ability used by an invocation. */
export const ability = SpaceBlobCapabilities.add.can

/**
 * Returns required input to the invocation.
 */
export const input = (digest: MultihashDigest, size: number) => ({
  blob: {
    digest: digest.bytes,
    size,
  },
})
