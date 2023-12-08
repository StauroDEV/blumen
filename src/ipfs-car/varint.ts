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

interface ReadResult {
  bytes: number
}

export function decode(buf: Uint8Array, offset = 0): [number, number] {
  let res = 0
  let shift = 0
  let counter = offset
  let b: number
  const l = buf.length
  let bytes = 0

  do {
    if (counter >= l || shift > 49) {
      bytes = 0
      throw new RangeError('Could not decode varint')
    }
    b = buf[counter++]
    res += shift < 28
      ? (b & REST) << shift
      : (b & REST) * Math.pow(2, shift)
    shift += 7
  } while (b >= MSB)

  bytes = counter - offset

  return [res, bytes]
}
