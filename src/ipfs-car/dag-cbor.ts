import { CID } from 'multiformats/cid'
import { Token, Type, encode, decode } from 'cborg'

const CID_CBOR_TAG = 42

function cidEncoder(obj: any): Token[] | null {
  if (obj.asCID !== obj && obj['/'] !== obj.bytes) {
    return null
  }
  const cid = CID.asCID(obj)
  if (!cid) {
    return null
  }
  const bytes = new Uint8Array(cid.bytes.byteLength + 1)
  bytes.set(cid.bytes, 1)
  return [
    new Token(Type.tag, CID_CBOR_TAG),
    new Token(Type.bytes, bytes),
  ]
}

function cidDecoder(bytes: Uint8Array) {
  if (bytes[0] !== 0) {
    throw new Error('Invalid CID for CBOR tag 42; expected leading 0x00')
  }
  return CID.decode(bytes.subarray(1)) // ignore leading 0x00
}

export const cborEncode = (data: unknown) => encode(data, {
  float64: true,
  typeEncoders: {
    Object: cidEncoder,
  },
})

export const cborDecode = (data: Uint8Array) => decode(data, {
  allowIndefinite: false,
  coerceUndefinedToNull: true,
  strict: true,
  useMaps: false,
  rejectDuplicateMapKeys: true,
  tags: { [CID_CBOR_TAG]: cidDecoder },
})
