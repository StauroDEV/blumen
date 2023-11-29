import { File } from 'node:buffer'

if (!('File' in globalThis)) {
  Object.assign(globalThis, { File })
}
