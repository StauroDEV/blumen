import colors from 'picocolors'
import type { PinStatus } from '../types.js'

export const pinStatus = (provider: string, status: PinStatus) => {
  let statusText: string

  switch (status) {
    case 'pinned':
      statusText = colors.green(status)
      break
    case 'queued':
      statusText = colors.cyan(status)
      break
    default:
      statusText = colors.gray(status || 'unknown')
      break
  }

  console.log(`${colors.cyan(provider)}: ${colors.bold(statusText)}`)
}
