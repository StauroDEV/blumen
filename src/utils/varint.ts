const MSB = 0x80

type Encoder = (num: number, out?: Uint8Array, offset?: number) => Uint8Array

export const encode: Encoder = (num, out = new Uint8Array(), offset?) => {
  out = out || []
  offset = offset || 0
  while (num >= 2 ** 31) {
    out[offset++] = (num & 0xff) | MSB
    num /= 128
  }
  while (num & ~0x7f) {
    out[offset++] = (num & 0xff) | MSB
    num >>>= 7
  }
  out[offset] = num | 0

  return out
}
