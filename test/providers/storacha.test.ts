import { describe, it } from 'node:test'

import { uploadOnWStoracha } from '../../src/providers/ipfs/storacha.js'
import assert from 'node:assert'
import { MissingKeyError } from '../../src/errors'

describe('Storacha provider', () => {
  describe('upload', () => {
    it('should throw if STORACHA_PROOF is missing', () => {
      assert.rejects(async () => {
        // @ts-expect-error only checking for passing an empty proof
        return await uploadOnWStoracha({ proof: '' })
      }, new MissingKeyError('STORACHA_PROOF'))
    })
  })
})
