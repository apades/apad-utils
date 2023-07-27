import { defineConfig } from 'tsup'
import { lessLoader } from 'esbuild-plugin-less'
import path from 'path'

const pr = (...p: any) => path.resolve(__dirname, ...p)

export default defineConfig({
  esbuildPlugins: [lessLoader()],
  treeshake: true,
})
