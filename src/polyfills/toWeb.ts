import { Writable, finished } from 'node:stream'
import { WritableStreamDefaultController } from 'node:stream/web'
import { destroy } from './destroy.js'

const kDestroyed = Symbol('kDestroyed')

function isDestroyed(stream: Writable) {
  const wState = (stream as any)._writableState
  const rState = (stream as any)._readableState

  const state = wState || rState

  return !!(
    stream.destroyed ||
    // @ts-ignore
    stream[kDestroyed] ||
    (state !== null && state !== void 0 && state.destroyed)
  )
}

function isWritable(stream: Writable) {
  if (isDestroyed(stream)) return false
  return stream.writable && !isWritableEnded(stream)
}

function createDeferredPromise() {
  let resolve: (val?: void) => void = () => {}
  let reject: (reason?: any) => void = () => {}
  const promise = new Promise<void>((res, rej) => {
    resolve = res
    reject = rej
  })

  return { promise, resolve, reject }
}

function isWritableEnded(stream: Writable) {
  if (stream.writableEnded === true) return true
  const wState = (stream as any)._writableState
  if (wState?.errored) return false
  if (typeof wState?.ended !== 'boolean') return null
  return wState.ended
}

class AbortError extends Error {
  code: string

  constructor(message = 'The operation was aborted', options?: ErrorOptions) {
    super(message, options)
    this.code = 'ABORT_ERR'
    this.name = 'AbortError'
  }
}

export function writableToWeb(streamWritable: Writable) {
  if (isDestroyed(streamWritable) || !isWritable(streamWritable)) {
    const writable = new WritableStream()
    writable.close()
    return writable
  }

  const highWaterMark = streamWritable.writableHighWaterMark
  const strategy = streamWritable.writableObjectMode
    ? new CountQueuingStrategy({ highWaterMark })
    : { highWaterMark }

  let controller: WritableStreamDefaultController | undefined
  let backpressurePromise: ReturnType<typeof createDeferredPromise> | undefined
  let closed: ReturnType<typeof createDeferredPromise> | undefined

  function onDrain() {
    if (backpressurePromise !== undefined) {
      backpressurePromise.resolve()
    }
  }

  const cleanup = finished(streamWritable, (error) => {
    cleanup()
    streamWritable.on('error', () => {})
    if (error != null) {
      if (backpressurePromise !== undefined) {
        backpressurePromise.reject(error)
      }

      if (closed !== undefined) {
        closed.reject(error)
        closed = undefined
      }
      controller!.error(error)
      controller = undefined
      return
    }

    if (closed !== undefined) {
      closed.resolve()
      closed = undefined
      return
    }
    controller!.error(new AbortError())
    controller = undefined
  })

  streamWritable.on('drain', onDrain)

  return new WritableStream(
    {
      start(c) {
        controller = c
      },

      async write(chunk) {
        if (streamWritable.writableNeedDrain || !streamWritable.write(chunk)) {
          backpressurePromise = createDeferredPromise()
          return backpressurePromise.promise.finally(() => {
            backpressurePromise = undefined
          })
        }
      },

      abort(reason) {
        destroy(streamWritable, reason)
      },

      close(): void | Promise<void> {
        if (closed === undefined && !isWritableEnded(streamWritable)) {
          closed = createDeferredPromise()
          streamWritable.end()
          return closed.promise
        }

        controller = undefined
        return Promise.resolve()
      },
    },
    strategy,
  )
}
