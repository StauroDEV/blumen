import fetch, { Headers, Request, Response, FormData } from 'node-fetch'

if (!('fetch' in globalThis)) {
  Object.assign(globalThis, { fetch, Headers, Request, Response, FormData })
}
