import * as colors from 'colorette'
import { isTTY } from '../constants.js'
import { logger } from '../utils/logger.js'

let retryCount = 0

const gwOfflineMessage = `😞 Max retries exceeded. Gateway is ${isTTY ? colors.bold(colors.red('Offline')) : 'Offline'}.`

export const pingAction = async (
  { cid, endpoint, options }: {
    cid: string
    endpoint: string
    options: Partial<{ maxRetries: number, retryInterval: number, timeout: number }>
  },
): Promise<void> => {
  const { maxRetries: retries = Infinity, retryInterval = 5000, timeout = 10000 } = options

  retryCount++
  const url = `https://${cid}.ipfs.${endpoint}`
  logger.info(`${isTTY
    ? `${colors.bold(`[${retryCount}]`)}: Requesting content at ${url}`
    : `[${retryCount}]`}: Requesting content at ${url}`,
  )
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(timeout), redirect: 'follow' })
    if (response.status === 504) {
      if (retries > 1) {
        logger.info(`🔄 Retrying in ${retryInterval / 1000} seconds...`)
        await new Promise(resolve => setTimeout(resolve, retryInterval))
        return pingAction({ cid, endpoint, options: { maxRetries: retries - 1, retryInterval } })
      }
      else {
        return logger.error(gwOfflineMessage)
      }
    }
    else {
      return logger.info(`Gateway status: ${
        response.status >= 200 && response.status < 400
        ? (isTTY ? colors.bold(colors.green(`Online ${response.status}`)) : `Online ${response.status}`)
        : response.status
      }`)
    }
  }
  catch (error) {
    if (error instanceof DOMException) {
      if (retries > 1) {
        logger.info(`⌛ Timed out. Retrying...`)
        return pingAction({ cid, endpoint, options: { maxRetries: retries - 1, retryInterval } })
      }
      else {
        return logger.error(gwOfflineMessage)
      }
    }
    logger.error('Error fetching endpoint:', (error as Error).message)
    throw error
  }
}
