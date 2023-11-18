import { table } from 'table'
import type { PinStatus, FilecoinDeal } from '../types.js'
import { colors } from 'consola/utils'

export const pinStatus = (
  provider: string,
  status: PinStatus,
  deals?: FilecoinDeal[],
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

  if (deals) {
    table(
      deals.map(({
        dealId, status,
      }) => [dealId, status]),
      { header: { alignment: 'left', content: 'Filecoin deals' } },
    )
  }
}
