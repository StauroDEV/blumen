import { readFile } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '../..')

export async function getVersion(): Promise<string > {
  const packageData = await readFile(path.resolve(root, 'package.json'), 'utf-8')
  const packageJson = JSON.parse(packageData)
  const packageVersion = packageJson.version
  return packageVersion as string
}
