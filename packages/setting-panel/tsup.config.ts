import { defineConfig } from 'tsup'
import { lessLoader } from 'esbuild-plugin-less'
import path from 'path'

const pr = (...p: any) => path.resolve(__dirname, ...p)

export default defineConfig({
  esbuildPlugins: [lessLoader()],
  esbuildOptions(options, context) {
    options.alias = {
      ...options.alias,
      react: pr('node_modules/preact/compat'),
      'react-dom': pr('node_modules/preact/compat'),
    }
  },
  treeshake: true,
})
