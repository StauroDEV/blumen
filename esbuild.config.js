import { commonjs } from '@hyrious/esbuild-plugin-commonjs'
import { build } from 'esbuild'
import { builtinModules } from 'node:module'

const esmPackages = [
  'spektr',
  'ipfs-car',
  '@stauro/',
  '@ipld/car',
  'uint8arrays',
  'multiformats',
  '@web3-storage/',
  '@ucanto/',
  '@ipld/',
  'cborg',
  '@noble/',
  '@scure/',
  'sync-multihash-sha2',
  'carstream',
  'uint8arraylist',
  '@perma/',
  'actor',
  'p-retry',
  'is-network-error',
  'viem',
  'ox',
  'isows',
  'abitype',
]

await build({
  entryPoints: ['src/cli.ts'],
  bundle: true,
  format: 'esm',
  target: 'es2023',
  platform: 'node',
  external: [...builtinModules, ...builtinModules.map(m => `node:${m}`)],
  outfile: 'dist/cli.js',
  plugins: [commonjs({ transform: (path) => {
    return !esmPackages.some(pkg => path.includes(pkg))
  } })],
}).catch(() => process.exit(1))
