import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { writeFile } from 'node:fs/promises'

const { stdout } = await promisify(exec)(`git describe --tags --abbrev=0`)

const patchVersion = stdout.slice(stdout.lastIndexOf('.'))

const newVersion = stdout.replace('v', '').replace(patchVersion, `.${parseInt(patchVersion[1]) + 1}`)

await writeFile('./src/utils/version.ts', `export const BLUMEN_VERSION = '${newVersion}'\n`)
