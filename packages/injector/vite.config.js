import path from 'path'
import { defineConfig } from 'vite'

const pr = (...p) => path.resolve(__dirname, ...p)
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [],
  resolve: {
    alias: {
      '@pkgs': pr('../'),
    },
  },
})
