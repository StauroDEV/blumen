import { describe, it } from 'bun:test'
import * as assert from 'node:assert'
import path from 'node:path'
import { exists, fileSize, walk } from '../../src/utils/fs'

describe('fs utils', () => {
  describe('walk', () => {
    it('should walk the directory, return total size and files', async () => {
      const [size, files] = await walk(
        path.resolve(import.meta.dirname, '../fixtures/walk'),
      )
      assert.strictEqual(size, 25)
      assert.deepStrictEqual(
        files.map(({ name, size }) => ({ name, size })),
        [
          {
            name: 'a.txt',
            size: 11,
          },
          {
            name: 'b.txt',
            size: 11,
          },
          {
            name: 'c.txt',
            size: 3,
          },
        ],
      )
    })
  })
  describe('exists', () => {
    it('should return true if file exists', async () => {
      assert.strictEqual(
        await exists(
          path.resolve(import.meta.dirname, '../fixtures/walk/a.txt'),
        ),
        true,
      )
    })
    it('should return false if file does not exist', async () => {
      assert.strictEqual(
        await exists(
          path.resolve(
            import.meta.dirname,
            '../fixtures/walk/does-not-exist.txt',
          ),
        ),
        false,
      )
    })
  })
  describe('fileSize', () => {
    it('should return the file size in bytes', () => {
      assert.strictEqual(fileSize(1024), '1.0KB')
    })
  })
})
