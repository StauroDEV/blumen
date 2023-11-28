import fetch, { Headers, Request, Response, FormData, Blob, File } from 'node-fetch'

if (!('fetch' in globalThis)) {
  Object.assign(globalThis, { fetch, Headers, Request, Response, FormData })
}

if (!('Blob' in globalThis)) {
  Object.assign(globalThis, { Blob, File })
}
