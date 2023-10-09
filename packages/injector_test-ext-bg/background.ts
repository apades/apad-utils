import { initClient } from '@pkgs/injector/src/core/client'
import Messager from '@pkgs/injector/src/core/ext-bg-messager/background'
import { injectorConfig } from './config'
const injector = initClient({
  ...injectorConfig,
  Messager,
})
;(globalThis as any).injector = injector
