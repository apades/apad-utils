import path from 'node:path'
import { lessLoader } from 'esbuild-plugin-less'
import fs from 'fs-extra'
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
  async onSuccess() {
    setTimeout(() => {
      const src = [
        pr('../preact/index.d.ts'),
        pr('../preact/index.d.mts'),
      ]

      src.forEach((file) => {
        const content = fs.readFileSync(file, 'utf-8')
        fs.writeFileSync(file, content.replace(`import { ReactNode } from 'entry';`, `import { vNode } from 'preact';`))
      })
    }, 3e3)
  },
})
