import { defineConfig } from 'tsup'
import { lessLoader } from 'esbuild-plugin-less'
import { replace } from 'esbuild-plugin-replace'
import path from 'path'

const pr = (...p: any) => path.resolve(__dirname, ...p)

export default defineConfig({
  esbuildPlugins: [
    lessLoader(),
    replace({
      'preact/hooks': 'react',
      'preact/compat': 'react',
      preact: 'react',
    }),
  ],
  esbuildOptions(option, ctx) {
    option.alias = option.alias || {}
    Object.assign(option.alias, {
      entry: pr('../src/entry-react'),
    })
  },
  treeshake: true,
  shims: true,
  target: 'esnext',
  tsconfig: pr('../tsconfig.m.json'),
})
