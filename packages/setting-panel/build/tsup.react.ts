import path from 'node:path'
import { lessLoader } from 'esbuild-plugin-less'
import { replace } from 'esbuild-plugin-replace'
import { defineConfig } from 'tsup'

const pr = (...p: any) => path.resolve(__dirname, ...p)

export default defineConfig({
  esbuildPlugins: [
    lessLoader(),
    replace({
      'preact/hooks': 'react',
      'preact/compat': 'react',
      'preact': 'react',
    }),
  ],
  esbuildOptions(option) {
    option.alias = option.alias || {}
    Object.assign(option.alias, {
      entry: pr('../src/entry-react'),
    })
  },
  treeshake: true,
  shims: true,
  target: 'esnext',
  tsconfig: pr('../tsconfig.m.json'),
  format: ['esm', 'cjs'],
  dts: true,
  minify: true,
  env: {
    NODE_ENV: 'production',
  },
})
