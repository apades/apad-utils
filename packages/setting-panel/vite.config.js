import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const pr = (...p) => path.resolve(__dirname, ...p)
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@pkgs': pr('../'),
      'preact/hooks': pr('node_modules/react'),
      'preact/compat': pr('node_modules/react'),
      preact: pr('node_modules/react'),
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        charset: false,
        additionalData: '@import "../utils/src/mixin.less";',
        javascriptEnabled: true,
      },
    },
  },
})
