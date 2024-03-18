#!/usr/bin/env node

import { cac } from 'cac'

import { ensAction } from './actions/ens.js'
import { statusAction } from './actions/status.js'
import { deployAction } from './actions/deploy.js'

import './polyfills/globals.js'
import { pingAction } from './actions/ping.js'
import { getVersion } from './utils/version.js'

const cli = cac('blumen')

cli
  .command('deploy [dir]', 'Deploy a web app on IPFS')
  .option('--strict', 'Throw if one of the providers fails', { default: true })
  .option('--ens <domain>', 'Update Content-Hash of an ENS domain')
  .option('--resolver-address <address>', 'Custom ENS Resolver address')
  .option('--chain <chain>', 'Chain to use for ENS', { default: 'mainnet' })
  .option('--name <name>', 'Name of the distribution (without file extension)')
  .option('--dist <dist>', 'Directory to store the distribution file')
  .option('--providers <providers>', 'Explicit provider order')
  .option('--verbose', 'More verbose logs')
  .option('--safe <safe>', 'Deploy using a Safe multi-sig')
  .action(deployAction)
  .example('blumen deploy --strict ./dist')

cli
  .command('status <cid>', 'Check IPFS deployment status')
  .option('--providers <providers>', 'List providers to check status from')
  .option('--verbose', 'More verbose logs')
  .action(statusAction)
  .example('blumen status bafybeibp54tslsez36quqptgzwyda3vo66za3rraujksmsb3d5q247uht4 --providers web3.storage')

cli
  .command(
    'ens <cid> <domain>',
    'Update ENS domain Content-Hash with an IFPS CID',
  )
  .option('--chain <chain>', 'Chain to use', { default: 'mainnet' })
  .option('--safe <safe>', 'Deploy using a Safe multi-sig')
  .option('--rpc-url <url>', 'Custom Ethereum RPC')
  .option('--resolver-address <address>', 'Custom ENS Resolver address')
  .action(ensAction)

cli.command('ping <cid> <endpoint>', 'Ping an endpoint until it resolves content')
  .option('--max-retries', 'Max retries', { default: Infinity })
  .option('--retry-interval', 'Interval between retries (in ms)', { default: 5000 })
  .option('--timeout', 'Request timeout until next attempt (in ms)', { default: 10000 })
  .action(pingAction)

cli.help()
cli.version(await getVersion())
cli.parse()
