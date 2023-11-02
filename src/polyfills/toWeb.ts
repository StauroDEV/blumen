/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Readable, Writable, finished } from 'node:stream'
import {
  type WritableStreamDefaultController,
  type ReadableStreamDefaultController,
  WritableStream,
  ReadableStream,
  CountQueuingStrategy
} from 'node:stream/web'
import { destroy } from './destroy.js'

const kDestroyed = Symbol('kDestroyed')

function isDestroyed(stream: Writable | Readable) {
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
      }
    },
    strategy,
  )
}

function isReadableFinished(stream: Readable, strict?: boolean) {
  const rState = (stream as any)._readableState
  if (rState !== null && rState !== void 0 && rState.errored) {
    return false
  }
  if (
    typeof (rState === null || rState === void 0
      ? void 0
      : rState.endEmitted) !== 'boolean'
  ) {
    return null
  }
  return !!(
    rState.endEmitted ||
    (strict === false && rState.ended === true && rState.length === 0)
  )
}

function isReadable(stream: Readable) {
  if (stream && stream.readable != null) {
    return stream.readable
  }
  if (
    typeof (stream === null || stream === void 0 ? void 0 : stream.readable) !==
    'boolean'
  ) {
    return null
  }
  if (isDestroyed(stream)) {
    return false
  }
  return stream.readable && !isReadableFinished(stream)
}

export function readableToWeb(streamReadable: Readable) {
  if (isDestroyed(streamReadable) || !isReadable(streamReadable)) {
    const readable = new ReadableStream()
    readable.cancel()
    return readable
  }

  const objectMode = streamReadable.readableObjectMode
  const highWaterMark = streamReadable.readableHighWaterMark

  const evaluateStrategyOrFallback = () => {
    if (objectMode) {
      // When running in objectMode explicitly but no strategy, we just fall
      // back to CountQueuingStrategy
      return new CountQueuingStrategy({ highWaterMark })
    }

    // When not running in objectMode explicitly, we just fall
    // back to a minimal strategy that just specifies the highWaterMark
    // and no size algorithm. Using a ByteLengthQueuingStrategy here
    // is unnecessary.
    return { highWaterMark }
  }

  const strategy = evaluateStrategyOrFallback()

  let controller: ReadableStreamDefaultController

  function onData(chunk: Uint8Array) {
    // Copy the Buffer to detach it from the pool.
    if (Buffer.isBuffer(chunk) && !objectMode) {
      chunk = new Uint8Array(chunk)
    }
    controller.enqueue(chunk)
    if (controller.desiredSize! <= 0) {
      streamReadable.pause()
    }
  }

  streamReadable.pause()

  const cleanup = finished(streamReadable, (error) => {
    if (error?.code === 'ERR_STREAM_PREMATURE_CLOSE') {
      const err = new AbortError(undefined, { cause: error })
      error = err
    }

    cleanup()
    // This is a protection against non-standard, legacy streams
    // that happen to emit an error event again after finished is called.
    streamReadable.on('error', () => {})
    if (error) {
      return controller.error(error)
    }
    controller.close()
  })

  streamReadable.on('data', onData)

  return new ReadableStream(
    {
      start(c) {
        controller = c
      },

      pull() {
        streamReadable.resume()
      },

      cancel(reason) {
        destroy(streamReadable, reason)
      }
    },
    strategy,
  )
}
