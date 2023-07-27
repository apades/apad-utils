import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

const pr = (...p) => path.resolve(__dirname, ...p)
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      gzipSize: true,
      brotliSize: true,
      emitFile: false,
      filename: 'analyzer.html', //分析图生成的文件名
      open: true, //如果存在本地服务端口，将在打包后自动展示
    }),
  ],
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
