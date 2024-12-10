import path from 'node:path'
import { lessLoader } from 'esbuild-plugin-less'
import { defineConfig } from 'tsup'

const pr = (...p: any) => path.resolve(__dirname, ...p)

export default defineConfig({
  esbuildPlugins: [lessLoader()],
  esbuildOptions(option) {
    option.alias = option.alias || {}
    Object.assign(option.alias, {
      entry: pr('../src/entry-preact'),
    })
  },
  treeshake: true,
  shims: true,
  target: 'esnext',
  format: ['esm', 'cjs', 'iife'],
  dts: true,
  minify: true,
  env: {
    NODE_ENV: 'production',
  },
})
