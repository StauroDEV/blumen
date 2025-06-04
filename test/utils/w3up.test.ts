import { describe, it } from 'bun:test'
import assert from 'node:assert'
import { setup } from '../../src/utils/storacha/setup'

describe('w3up utils', () => {
  describe('setupW3Up', () => {
    it('throws if fails to parse a UCAN delegate private key', () => {
      assert.rejects(
        async () => {
          return await setup({
            pk: 'private key',
            proof: 'proof',
          })
        },
        {
          message:
            'Unable to decode multibase string "private key", base64pad decoder only supports inputs prefixed with M',
        },
      )
    })
    it('throws if fails to parse a UCAN proof', () => {
      assert.rejects(
        async () => {
          return await setup({
            // randomly generated via `pnpx ucan-key ed`
            pk: 'MgCab19pJVNmv3hPJFnciLpZIlVGsTtLWoWU/+30KpiUzgO0Bfk+h6nzqc2u0lrgbis8MJnJVNlooc+YRni3uY2ZpXxQ=',
            proof: 'proof',
          })
        },
        {
          message: 'Failed to parse UCAN proof',
        },
      )
    })
  })
})
