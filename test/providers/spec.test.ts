import assert from 'node:assert'
import { describe, it } from 'node:test'
import { specPin } from '../../src/providers/ipfs/spec.js'
import { UploadNotSupportedError } from '../../src/errors.js'

describe('spec provider', () => {
  describe('pin', () => {
    it('should throw if pinning was chosen as a first provider', () => {
      assert.rejects(async () => {
        // @ts-expect-error only checking if it throws by passing `first`
        return await specPin({ first: true, providerName: 'Test' })
      }, new UploadNotSupportedError('Test'))
    })
  })
})
