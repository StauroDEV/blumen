import { readFile, writeFile } from 'node:fs/promises'

const pkg = await readFile('./package.json', 'utf8')

const {version} = JSON.parse(pkg)

await writeFile('./src/utils/version.ts', `export const BLUMEN_VERSION = '${version}'`)