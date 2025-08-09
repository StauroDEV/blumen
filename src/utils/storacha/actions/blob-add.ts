import * as BlobCapabilities from '@storacha/capabilities/blob'
import * as HTTPCapabilities from '@storacha/capabilities/http'
import * as SpaceBlobCapabilities from '@storacha/capabilities/space/blob'
import * as UCAN from '@storacha/capabilities/ucan'
import { SpaceDID } from '@storacha/capabilities/utils'
import { Delegation, Receipt } from '@ucanto/core'
import type {
  Block,
  Effect,
  Invocation as IFInvocation,
  Receipt as IFReceipt,
  Link,
  ReceiptModel,
  UCANLink,
} from '@ucanto/interface'
import type { MultihashDigest } from 'multiformats'
import retry, { AbortError } from 'p-retry'
import { uploadServicePrincipal } from '../../../providers/ipfs/storacha.js'
import { connection } from '../agent.js'
import type { BlobAddOk, InvocationConfig } from '../types.js'

function input(digest: MultihashDigest, size: number) {
  return { blob: { digest: digest.bytes, size } }
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null
}

function getConcludeReceipt<
  Ok extends object = object,
  Err extends Error = Error,
  Ran extends IFInvocation = IFInvocation,
>(inv: Ran): IFReceipt {
  const cap0 = inv.capabilities[0] as unknown
  if (!isRecord(cap0)) throw new Error('invalid conclude capability')
  const nb = cap0.nb
  if (!isRecord(nb)) throw new Error('invalid conclude nb')
  const receipt = nb.receipt as Link | undefined
  if (!receipt) throw new Error('conclude receipt link missing')

  const blocks = new Map<string, Block>()
  for (const block of inv.iterateIPLDBlocks()) blocks.set(`${block.cid}`, block)
  return Receipt.view({
    root: receipt as Link<ReceiptModel<Ok, Err, Ran>>,
    blocks,
  }) as IFReceipt
}

type NextTasks = {
  allocate: { task: IFInvocation; receipt: IFReceipt }
  put?: { task: IFInvocation; receipt?: IFReceipt }
  accept: { task: IFInvocation; receipt: IFReceipt }
}

function parseBlobAddReceiptNext<
  Ok extends object = object,
  Err extends Error = Error,
  Ran extends IFInvocation = IFInvocation,
>(result: IFReceipt<Ok, Err, Ran>): NextTasks {
  const fork = result.fx.fork as unknown as (IFInvocation | Effect)[]
  const invocations: IFInvocation[] = fork.filter(
    (fx): fx is IFInvocation =>
      isRecord(fx) &&
      Array.isArray((fx as Record<string, unknown>).capabilities),
  )

  const canOf = (fx: IFInvocation) => fx.capabilities[0]?.can
  const allocateTask = invocations.find(
    (fx) => canOf(fx) === BlobCapabilities.allocate.can,
  )
  const putTask = invocations.find(
    (fx) => canOf(fx) === HTTPCapabilities.put.can,
  )
  const acceptTask = invocations.find(
    (fx) => canOf(fx) === BlobCapabilities.accept.can,
  )
  const concludefxs = invocations.filter(
    (fx) => canOf(fx) === UCAN.conclude.can,
  )

  if (!allocateTask || !acceptTask)
    throw new Error('mandatory effects not received')

  const receipts = concludefxs.map(getConcludeReceipt)
  const match = (task: IFInvocation) =>
    receipts.find((r) => r.ran.link().equals(task.cid)) as IFReceipt | undefined

  const allocateReceipt = match(allocateTask)
  const putReceipt = putTask ? match(putTask) : undefined
  const acceptReceipt = match(acceptTask)

  if (!allocateReceipt || !acceptReceipt)
    throw new Error('mandatory receipts not received')

  return {
    allocate: { task: allocateTask, receipt: allocateReceipt },
    ...(putTask ? { put: { task: putTask, receipt: putReceipt } } : {}),
    accept: { task: acceptTask, receipt: acceptReceipt },
  }
}

function readAddress(
  r: IFReceipt,
): { url: string; headers: Record<string, string> } | undefined {
  const ok = (r as unknown as { out?: { ok?: unknown } }).out?.ok
  if (!isRecord(ok)) return undefined
  const addr = ok.address
  if (!isRecord(addr)) return undefined
  const url = addr.url
  const headers = (addr.headers as Record<string, unknown>) || {}
  if (typeof url !== 'string') return undefined
  const h: Record<string, string> = {}
  for (const [k, v] of Object.entries(headers))
    if (typeof v === 'string') h[k] = v
  return { url, headers: h }
}

function readSiteLink(r: IFReceipt): Link | undefined {
  const ok = (r as unknown as { out?: { ok?: unknown } }).out?.ok
  if (!isRecord(ok)) return undefined
  return ok.site as Link | undefined
}

export async function add(
  { issuer, with: resource, proofs, audience }: InvocationConfig,
  digest: MultihashDigest,
  data: Blob | Uint8Array,
): Promise<BlobAddOk> {
  const bytes =
    data instanceof Uint8Array ? data : new Uint8Array(await data.arrayBuffer())
  const size = bytes.length
  const conn = connection

  const result = await retry(
    async () =>
      await SpaceBlobCapabilities.add
        .invoke({
          issuer,
          audience: audience ?? uploadServicePrincipal,
          with: SpaceDID.from(resource),
          nb: input(digest, size),
          proofs,
        })
        .execute(conn),
    { onFailedAttempt: console.warn, retries: 3 },
  )

  if (!result.out.ok) {
    throw new Error(`failed ${SpaceBlobCapabilities.add.can} invocation`, {
      cause: result.out.error,
    })
  }

  const next = parseBlobAddReceiptNext(result)
  const { receipt: allocateReceipt } = next.allocate
  if (!allocateReceipt.out.ok) {
    throw new Error(`failed ${SpaceBlobCapabilities.add.can} invocation`, {
      cause: allocateReceipt.out.error,
    })
  }

  const address = readAddress(allocateReceipt)
  if (address) {
    await retry(
      async () => {
        const res = await fetch(address.url, {
          method: 'PUT',
          body: bytes,
          headers: address.headers,
          // @ts-expect-error - required by recent node versions
          duplex: 'half',
        })
        if (res.status >= 400 && res.status < 500)
          throw new AbortError(`upload failed: ${res.status}`)
        if (!res.ok) throw new Error(`upload failed: ${res.status}`)
        await res.arrayBuffer()
      },
      { retries: 3 },
    )
  }

  const { receipt: acceptReceipt } = next.accept
  if (!acceptReceipt.out.ok) {
    throw new Error(`${BlobCapabilities.accept.can} failure`, {
      cause: acceptReceipt.out.error,
    })
  }

  const blocks = new Map(
    [...acceptReceipt.iterateIPLDBlocks()].map((block) => [
      `${block.cid}`,
      block,
    ]),
  )
  const siteRoot = readSiteLink(acceptReceipt)
  if (!siteRoot) throw new Error('missing site link in accept receipt')

  const site = Delegation.view({
    root: siteRoot as UCANLink,
    blocks,
  }) as BlobAddOk['site']
  return { site }
}

export const ability = SpaceBlobCapabilities.add.can
