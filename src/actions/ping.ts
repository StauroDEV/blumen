import * as colors from 'colorette'

let retryCount = 0

const gwOfflineMessage = `😞 Max retries exceeded. Gateway is ${colors.bold(colors.red('Offline'))}.`

export const pingAction = async (
  cid: string, endpoint: string, { maxRetries: retries = Infinity, retryInterval = 5000, timeout = 10000 }:
  Partial<{ maxRetries: number, retryInterval: number, timeout: number }>,
): Promise<void> => {
  retryCount++
  const url = `https://${cid}.ipfs.${endpoint}`
  console.log(`${colors.bold(`[${retryCount}]`)}: Requesting content at ${url}`)
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(timeout), redirect: 'follow' })
    if (response.status === 504) {
      if (retries > 1) {
        console.log(`🔄 Retrying in ${retryInterval / 1000} seconds...`)
        await new Promise(resolve => setTimeout(resolve, retryInterval))
        return pingAction(cid, endpoint, { maxRetries: retries - 1, retryInterval })
      }
      else {
        return console.error(gwOfflineMessage)
      }
    }
    else {
      return console.log(`Gateway status: ${
        response.status >= 200 && response.status < 400
        ? colors.bold(colors.green(`Online ${response.status}`))
        : response.status
      }`)
    }
  }
  catch (error) {
    if (error instanceof DOMException) {
      if (retries > 1) {
        console.log(`⌛ Timed out. Retrying...`)
        return pingAction(cid, endpoint, { maxRetries: retries - 1, retryInterval })
      }
      else {
        return console.error(gwOfflineMessage)
      }
    }
    console.error('Error fetching endpoint:', (error as Error).message)
    throw error
  }
}
