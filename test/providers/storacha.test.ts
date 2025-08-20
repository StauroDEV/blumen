/** biome-ignore-all lint/style/noNonNullAssertion: asserting env tokens */
import { describe, expect, it } from 'bun:test'
import { MissingKeyError } from '../../src/errors'
import { uploadOnStoracha } from '../../src/providers/ipfs/storacha.js'
import { walk } from '../../src/utils/fs.js'
import { packCAR } from '../../src/utils/ipfs.js'

describe('Storacha provider', () => {
  describe('upload', () => {
    it('should throw if STORACHA_PROOF is missing', () => {
      // biome-ignore lint/suspicious/noExplicitAny: test
      expect(uploadOnStoracha({ proof: '' } as any)).rejects.toThrowError(
        new MissingKeyError('STORACHA_PROOF'),
      )
    })
    it.skip(
      'uploads a file',
      async () => {
        const [_, files] = await walk('./dist', false)
        const car = await packCAR(files, 'test.car')

        const { cid } = await uploadOnStoracha({
          proof: process.env.BLUMEN_STORACHA_PROOF!,
          token: process.env.BLUMEN_STORACHA_TOKEN!,
          name: 'test',
          first: true,
          car: car.blob,
        })

        expect(cid).toEqual(car.rootCID.toString())
      },
      { timeout: 30_000 },
    )
  })
})
