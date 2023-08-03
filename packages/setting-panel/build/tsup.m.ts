import { defineConfig } from 'tsup'
import { lessLoader } from 'esbuild-plugin-less'
import path from 'path'

const pr = (...p: any) => path.resolve(__dirname, ...p)

export default defineConfig({
  esbuildPlugins: [lessLoader()],
  esbuildOptions(option, ctx) {
    option.alias = option.alias || {}
    Object.assign(option.alias, {
      'preact/hooks': 'react',
      'preact/compat': 'react',
      preact: 'react',
      entry: pr('../src/entry-react'),
    })
  },
  treeshake: true,
  shims: true,
  target: 'esnext',
})
