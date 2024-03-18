import { readFile } from 'node:fs/promises'

export async function getVersion(): Promise<string > {
  const packageData = await readFile('./package.json', 'utf-8')
  const packageJson = JSON.parse(packageData)
  const packageVersion = packageJson.version
  return packageVersion as string
}
