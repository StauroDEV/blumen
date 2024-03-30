import { MissingKeyError } from '../errors.js'
import { updateDnsLink } from '../utils/dnslink.js'
import { logger } from '../utils/logger.js'

export const dnsLinkAction = async (
  cid: string, name: string, {verbose}:{verbose:boolean} /* { init = false }: { init?: boolean } */
) => {
  const apiKey = process.env.BLUMEN_CF_KEY
  const zoneId = process.env.BLUMEN_CF_ZONE_ID

  if (!apiKey) throw new MissingKeyError(`CF_KEY`)
  if (!zoneId) throw new MissingKeyError(`CF_ZONE_ID`)

  // if (init) {
  //   logger.info(`Creating DNSLink`)
  //   const response = await createDnsLink({ cid, zoneId, apiKey })

  //   console.log(response)
  // }
  // else {
  logger.info(`Updating DNSLink`)
  try {
    const response = await updateDnsLink({ cid, zoneId, apiKey, name, verbose })

    if (response.errors.length !== 0) return logger.error(response.errors[0].message)

    logger.success(`${response.result.name} now points to ${response.result.dnslink}`)
  }
  catch (e) {
    return logger.error(e)
  }
  // }
}
