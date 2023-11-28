#!/usr/bin/env node

import { cac } from 'cac'

import { ensAction } from './actions/ens.js'
import { statusAction } from './actions/status.js'
import { deployAction } from './actions/deploy.js'

import './polyfills/globals.js'

const cli = cac('blumen')

cli
  .command('deploy [dir]', 'Deploy a web app on IPFS')
  .option('--strict', 'Throw if one of the providers fails', { default: true })
  .option('--ens <domain>', 'Update Content-Hash of an ENS domain')
  .option('--chain <chain>', 'Chain to use for ENS', { default: 'mainnet' })
  .option('--name <name>', 'Name of the distribution (without file extension)')
  .option('--dist <dist>', 'Directory to store the distribution file')
  .option('--providers <providers>', 'Explicit provider order')
  .option('--verbose', 'More verbose logs')
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
  .option('--safe <safe>', 'Deploy using a Safe multisig wallet')
  .option('--rpc-url <url>', 'Custom Ethereum RPC')
  .action(ensAction)

cli.help()
cli.version('0.1.0')
cli.parse()
