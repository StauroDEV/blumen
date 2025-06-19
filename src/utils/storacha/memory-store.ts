import type { Driver } from './types.js'

export class StoreMemory<T extends Record<string, any> = Record<string, any>>
  implements Driver<T>
{
  #data: T | undefined

  constructor() {
    this.#data = undefined
  }

  async reset() {
    this.#data = undefined
  }

  async save(data: T) {
    this.#data = { ...data }
  }

  async load(): Promise<T | undefined> {
    if (this.#data === undefined) return
    if (Object.keys(this.#data).length === 0) return
    return this.#data
  }
}
