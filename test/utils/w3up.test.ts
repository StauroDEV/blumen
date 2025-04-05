import assert from 'node:assert'
import { describe, it } from 'node:test'
import { setupW3Up } from '../../src/utils/w3up.js'

describe('w3up utils', () => {
  describe('setupW3Up', () => {
    it('throws if fails to parse a UCAN delegate private key', () => {
      assert.rejects(async () => {
        return await setupW3Up({
          pk: 'private key',
          proof: 'proof',
        })
      }, {
        // eslint-disable-next-line @stylistic/max-len
        message: 'Unable to decode multibase string "private key", base64pad decoder only supports inputs prefixed with M',
      })
    })
    it('throws if fails to parse a UCAN proof', () => {
      assert.rejects(async () => {
        return await setupW3Up({
          // randomly generated via `pnpx ucan-key ed`
          pk: 'MgCab19pJVNmv3hPJFnciLpZIlVGsTtLWoWU/+30KpiUzgO0Bfk+h6nzqc2u0lrgbis8MJnJVNlooc+YRni3uY2ZpXxQ=',
          proof: 'proof',
        })
      }, {
        message: 'Failed to parse UCAN proof',
      })
    })
  })
})
