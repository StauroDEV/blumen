import { createInterface } from 'node:readline/promises'
import { styleText } from 'node:util'
import { Provider } from 'ox'
import { type Address, fromPublicKey } from 'ox/Address'
import type { Hex } from 'ox/Hex'
import { fromHttp } from 'ox/RpcTransport'
import { getPublicKey, randomPrivateKey } from 'ox/Secp256k1'
import { chains } from '../constants.js'
import { MissingCLIArgsError } from '../errors.js'
import type { ChainName } from '../types.js'
import { chainToRpcUrl, PUBLIC_RESOLVER_ADDRESS } from '../utils/ens.js'
import { logger } from '../utils/logger.js'
import {
  encodeMultiSendCall,
  encodeMultiSendCalldata,
} from '../utils/multisend.js'
import {
  type EIP3770Address,
  getEip3770Address,
} from '../utils/safe/eip3770.js'
import {
  allowSetContentHashForRoleData,
  createZodiacRoleData,
  setENSResolverAsScopeTarget,
} from '../utils/zodiac-roles/init.js'

type ZodiacActionOptions = Partial<{
  init: boolean
  rpcUrl: string
  chain: ChainName

  safe: Address | EIP3770Address
  resolverAddress: Address
}>

export const zodiacAction = async ({
  rolesModAddress,
  options = {},
}: {
  rolesModAddress: Address
  options?: ZodiacActionOptions
}) => {
  if (!rolesModAddress) throw new MissingCLIArgsError(['rolesModAddress'])
  // const transport = fromHttp(options.rpcUrl ?? chainToRpcUrl(options.chain ?? 'mainnet'))

  // const provider = Provider.from(transport)

  if (options.init) {
    const resolverAddress =
      options.resolverAddress ??
      PUBLIC_RESOLVER_ADDRESS[options.chain ?? 'mainnet']

    const safe = options.safe

    if (!safe) throw new MissingCLIArgsError(['safe'])

    let pk: Hex = process.env.BLUMEN_PK as Hex

    if (!pk) {
      logger.warn('`BLUMEN_PK` environment variable not set.')
      logger.info('Generating a Secp256k1 keypair')
      pk = randomPrivateKey()
      logger.text(`   ${styleText('bgBlue', pk)}`)
      logger.info('Save the private key and do not share it to anyone')
    }
    const roleAddress = fromPublicKey(getPublicKey({ privateKey: pk }))
    const assignRolesData = await createZodiacRoleData({ roleAddress })
    const scopeTargetData = await setENSResolverAsScopeTarget({
      resolverAddress,
    })
    const allowSetContentHashData = await allowSetContentHashForRoleData({
      resolverAddress,
    })

    const txs = [
      encodeMultiSendCall({ to: rolesModAddress, data: assignRolesData }),
      encodeMultiSendCall({ to: rolesModAddress, data: scopeTargetData }),
      encodeMultiSendCall({
        to: rolesModAddress,
        data: allowSetContentHashData,
      }),
    ]
    const data = encodeMultiSendCalldata(txs)

    const safeAddress = getEip3770Address({
      fullAddress: options.safe as EIP3770Address,
      chainId: chains[options.chain || 'mainnet'].id,
    })

    logger.text(
      `Open in a browser: ${styleText(
        'underline',
        `https://app.safe.global/apps/open?safe=${safeAddress.prefix}:${safeAddress.address}&appUrl=https%3A%2F%2Fcallthis.link`,
      )}`,
    )

    logger.text('To: 0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761')
    logger.text('Function: multiSend(bytes)')
    logger.text(`Data: ${data}`)
  }
}
