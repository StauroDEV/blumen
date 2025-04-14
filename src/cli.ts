#!/usr/bin/env node

import { CLI } from 'spektr'
import { colorPlugin } from 'spektr/plugins/color.js'

import { EnsActionArgs, ensAction } from './actions/ens.js'
import { statusAction } from './actions/status.js'
import { DeployActionArgs, deployAction } from './actions/deploy.js'

import { pingAction } from './actions/ping.js'
import { BLUMEN_VERSION } from './utils/version.js'
import { dnsLinkAction } from './actions/dnslink.js'
import { isTTY } from './constants.js'
import { packAction } from './actions/pack.js'
import { pinAction } from './actions/pin.js'

const cli = new CLI({ name: 'blumen', plugins: isTTY ? [colorPlugin] : [] })

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
}, {
  name: 'verbose',
  description: 'More verbose logs',
  type: 'boolean',
  short: 'v',
}, {
  name: 'dry-run',
  description: 'Do not send a transaction',
  type: 'boolean',
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
      short: 'n',
      description: 'Name of the distribution (without file extension)',
      type: 'string',
    },
    {
      name: 'dist',
      short: 'd',
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
  .command<[string]>('status', ([cid], options) => statusAction({ cid, options }), {
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
  .command<[string, string]>(
    'ens',
    ([cid, domain], options) => ensAction({
      cid,
      domain,
      options: options as EnsActionArgs,
    }),
    {
      description: 'Update ENS domain Content-Hash with an IFPS CID',
      options: ensOptions,
    },
  )

cli.command<[string, string]>('ping', ([cid, endpoint], options) => pingAction({
  cid,
  endpoint,
  options: Object.fromEntries(Object.entries(options).map(([k, v]) => [k, Number.parseInt(v as string)])),
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
      short: 't',
    },
  ] as const,
})

cli.command<[string, string]>('dnslink', ([cid, name], options) => dnsLinkAction({ cid, name, options }), {
  options: [
    {
      name: 'verbose',
      description: 'More verbose logs',
      type: 'boolean',
      short: 'v',
    },
  ] as const,
  description: 'Update DNSLink with a given CID using Cloudflare.',
})

cli.command<[string]>('pack', ([dir], options) => packAction({ dir, options }), {
  options: [{
    name: 'name',
    short: 'n',
    description: 'Name of the distribution (without file extension)',
    type: 'string',
  },
  {
    name: 'dist',
    short: 'd',
    description: 'Directory to store the distribution file',
    type: 'string',
  },
  {
    name: 'verbose',
    description: 'More verbose logs',
    type: 'boolean',
    short: 'v',
  }] as const,
  description: 'Pack websites files into a CAR without uploading it anywhere',
})

cli.command<[string]>('pin', ([cid], options) => pinAction({ cid, options }), {
  options: [
    {
      name: 'strict',
      description: 'Throw if one of the providers fails',
      type: 'boolean',
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
  ] as const,
  description: 'Pin an IPFS CID on multiple providers',
})

cli.help()
cli.version(BLUMEN_VERSION)
cli.handle(process.argv.slice(2))
