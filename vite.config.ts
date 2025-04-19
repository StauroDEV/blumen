import { defineConfig } from 'vite'

import { builtinModules } from 'module'

const nodeBuiltins = [...builtinModules, ...builtinModules.map(m => `node:${m}`)]

export default defineConfig({
  build: {
    lib: {
      entry: 'src/cli.ts',
      formats: ['es'],
      fileName: () => 'cli.js',
    },
    outDir: 'dist',
    rollupOptions: {
      external: nodeBuiltins,
    },
    minify: false,
    target: 'modules',
    emptyOutDir: true,
  },
})
