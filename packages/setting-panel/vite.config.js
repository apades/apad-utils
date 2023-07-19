import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@pkgs': path.resolve(__dirname, '../'),
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
