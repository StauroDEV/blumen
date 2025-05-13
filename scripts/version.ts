import { exec } from 'node:child_process'
import { writeFile } from 'node:fs/promises'
import { promisify } from 'node:util'

const { stdout } = await promisify(exec)(`git describe --tags --abbrev=0`)

const patchVersion = stdout.slice(stdout.lastIndexOf('.'))

const newVersion = stdout
  .replace('v', '')
  .replace(patchVersion, `.${parseInt(patchVersion[1]) + 1}`)

await writeFile(
  './src/utils/version.ts',
  `export const BLUMEN_VERSION = '${newVersion}'\n`,
)
