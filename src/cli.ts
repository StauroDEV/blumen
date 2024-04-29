#!/usr/bin/env node

import { CLI } from 'spektr'
import { colorPlugin } from 'spektr/plugins/color.js'

import { EnsActionArgs, ensAction } from './actions/ens.js'
import { statusAction } from './actions/status.js'
import { DeployActionArgs, deployAction } from './actions/deploy.js'

import './polyfills/globals.js'
import { pingAction } from './actions/ping.js'
import { BLUMEN_VERSION } from './utils/version.js'
import { dnsLinkAction } from './actions/dnslink.js'

const cli = new CLI({ name: 'blumen', plugins: [colorPlugin] })

const ensOptions = [{
  name: 'chain',
  description: 'Chain to use for ENS',
  type: 'string',
},
{
  name: 'safe',
  description: 'Deploy using a Safe multi-sig',
  type: 'string',
},
{
  name: 'resolver-address',
  description: 'Custom ENS Resolver address',
  type: 'string',
},
{
  name: 'rpc-url',
  description: 'Custom Ethereum RPC',
  type: 'string',
}] as const

cli.command('deploy', ([dir], options) => deployAction({
  dir: dir as string,
  options: options as DeployActionArgs,
}), {
  description: 'Deploy a web app on IPFS',
  options: [
    {
      name: 'strict',
      description: 'Throw if one of the providers fails',
      type: 'boolean',
    },
    {
      name: 'ens',
      description: 'Update Content-Hash of an ENS domain',
      type: 'string',
    },
    {
      name: 'name',
      description: 'Name of the distribution (without file extension)',
      type: 'string',
    },
    {
      name: 'dist',
      description: 'Directory to store the distribution file',
      type: 'string',
    },
    {
      name: 'providers',
      description: 'Explicit provider order',
      type: 'string',
    },
    {
      name: 'verbose',
      description: 'More verbose logs',
      type: 'boolean',
      short: 'v',
    },
    {
      name: 'dnslink',
      description: 'Update DNSLink',
      type: 'string',
    },
    ...ensOptions,
  ] as const,
})

cli
  .command('status', ([cid], options) => statusAction({ cid: cid as string, options }), {
    description: 'Check IPFS deployment status',
    options: [
      {
        name: 'providers',
        description: 'List providers to check status from',
        type: 'string',
      },
      {
        name: 'verbose',
        description: 'More verbose logs',
        type: 'boolean',
        short: 'v',
      },
    ] as const,
  })

cli
  .command(
    'ens',
    ([cid, domain], options) => ensAction({
      cid: cid as string,
      domain: domain as string,
      options: options as EnsActionArgs,
    }),
    {
      description: 'Update ENS domain Content-Hash with an IFPS CID',
      options: ensOptions,
    },
  )

cli.command('ping', ([cid, endpoint], options) => pingAction({
  cid: cid as string,
  endpoint: endpoint as string,
  options: Object.fromEntries(Object.entries(options).map(([k, v]) => [k, parseInt(v)])),

}), {
  description: 'Ping an endpoint until it resolves content',
  options: [
    {
      name: 'max-retries',
      description: 'Max retries',
      type: 'string',
    },
    {
      name: 'retry-interval',
      description: 'Interval between retries (in ms)',
      type: 'string',
    },
    {
      name: 'timeout',
      description: 'Request timeout until next attempt (in ms)',
      type: 'string',
    },
  ] as const,
})

cli.command('dnslink', ([cid, name], options) => dnsLinkAction({ cid: cid as string, name: name as string, options }), {
  options: [
    {
      name: 'verbose',
      description: 'More verbose logs',
      type: 'boolean',
      short: 'v',
    },
  ] as const,
})

cli.help()
cli.version(BLUMEN_VERSION)
cli.handle(process.argv.slice(2))
