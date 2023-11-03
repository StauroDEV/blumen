#!/usr/bin/env node

import { cac } from 'cac'

import { ensAction } from './actions/ens.js'
import { statusAction } from './actions/status.js'
import { deployAction } from './actions/deploy.js'
import { OperationType } from '@stauro/piggybank/types'

import './polyfills/fetch.js'

const cli = cac('blumen')

cli
  .command('deploy [dir]', 'Deploy a web app on IPFS')
  .option('--strict', 'Throw if one of the providers fails', { default: true })
  .option('--ens <domain>', 'Update Content-Hash of an ENS domain')
  .option('--chain <chain>', 'Chain to use for ENS', { default: 'mainnet' })
  .option('--name <name>', 'Name of the distribution (without file extension)')
  .option('--dist <dist>', 'Directory to store the distribution file')
  .action(deployAction)

cli
  .command('status <cid>', 'Check IPFS pinning status')
  .option('--providers <providers>', 'List providers to check status from')
  .action(statusAction)

cli
  .command(
    'ens <cid> <domain>',
    'Update ENS domain Content-Hash with an IFPS CID',
  )
  .option('--chain <chain>', 'Chain to use', { default: 'mainnet' })
  .option('--safe <safe>', 'Deploy using a Safe multisig wallet')
  .option('--operation-type <number>', 'Operation type to use for a Safe multisig wallet (0 - Call, 1 - DelegateCall)', { default: OperationType.Call })
  .action(ensAction)

cli.help()
cli.version('0.0.0-dev.1')
cli.example('blumen deploy --strict ./dist')
cli.parse()
