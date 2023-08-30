import { build } from 'esbuild'
import { globby } from 'globby'

await build({
  entryPoints: await globby('./src/**/*.{js,ts}'),
  outdir: 'dist',
  bundle: true,
  platform: 'node',
  target: 'node16',
  format: 'esm',
  external: ['*'],
}).catch((err) => console.error(err))
