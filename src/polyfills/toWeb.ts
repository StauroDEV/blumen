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
import { Buffer } from 'node:buffer'

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

export function readableToWeb(streamReadable: Readable) {
  const objectMode = streamReadable.readableObjectMode
  const highWaterMark = streamReadable.readableHighWaterMark

  const evaluateStrategyOrFallback = () => {
    if (objectMode) {
      return new CountQueuingStrategy({ highWaterMark })
    }

    return { highWaterMark }
  }

  const strategy = evaluateStrategyOrFallback()

  let controller: ReadableStreamDefaultController

  function onData(chunk: Uint8Array) {
    if (Buffer.isBuffer(chunk) && !objectMode) chunk = new Uint8Array(chunk)

    controller.enqueue(chunk)
    if (controller.desiredSize! <= 0) streamReadable.pause()
  }

  streamReadable.pause()

  const cleanup = finished(streamReadable, (error) => {
    if (error?.code === 'ERR_STREAM_PREMATURE_CLOSE') {
      const err = new AbortError(undefined, { cause: error })
      error = err
    }
    cleanup()

    if (error) return controller.error(error)

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
      }
    },
    strategy,
  )
}
