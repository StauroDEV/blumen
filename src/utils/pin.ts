import type { PinStatus } from '../types.js'
import * as colors from 'colorette'

export const pinStatus = (
  provider: string,
  status: PinStatus,
) => {
  let statusText: string

  switch (status) {
    case 'pinned':
      statusText = colors.green(status)
      break
    case 'queued':
      statusText = colors.cyan(status)
      break
    case 'unknown':
    default:
      statusText = colors.gray(status || 'unknown')
      break
  }

  console.log(`${colors.cyan(provider)}: ${colors.bold(statusText)}`)
}
