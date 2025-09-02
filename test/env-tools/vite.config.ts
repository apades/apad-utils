import { defineConfig } from 'vite'
import { getDefinesObject } from '@apad/env-tools/bundler'

console.log('getDefinesObject()', getDefinesObject())
export default defineConfig({
  define: getDefinesObject(),
})
