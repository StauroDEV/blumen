import { styleText } from 'node:util'
import type { PinStatus } from '../types.js'

export const pinStatus = (provider: string, status: PinStatus) => {
  let statusText: string

  switch (status) {
    case 'pinned':
      statusText = styleText('green', status)
      break
    case 'queued':
      statusText = styleText('cyan', status)
      break
    default:
      statusText = styleText('gray', status || 'unknown')
      break
  }

  console.log(
    `${styleText('cyan', provider)}: ${styleText('bold', statusText)}`,
  )
}
