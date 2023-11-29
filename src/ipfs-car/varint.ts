/**
 * Chunk of varint
 * https://github.com/chrisdickinson/varint
 * Copyright (c) 2020 Chris Dickinson
*/

const MSB = 0x80
const REST = 0x7F
const MSBALL = ~REST
const INT = Math.pow(2, 31)

export function encode(num: number, out: number[] = [], offset: number = 0): number[] {
  if (Number.MAX_SAFE_INTEGER && num > Number.MAX_SAFE_INTEGER) {
    // encode.bytes = 0
    throw new RangeError('Could not encode varint')
  }

  while (num >= INT) {
    out[offset++] = (num & 0xFF) | MSB
    num /= 128
  }
  while (num & MSBALL) {
    out[offset++] = (num & 0xFF) | MSB
    num >>>= 7
  }
  out[offset] = num | 0

  return out
}
