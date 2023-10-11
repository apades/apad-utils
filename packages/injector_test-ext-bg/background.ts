import { initClient } from '@apad/injector/client'
import Messager from '@apad/injector/ext-bg-messager/background'
import { injectorConfig } from './config'
const injector = initClient({
  ...injectorConfig,
  Messager,
})
;(globalThis as any).injector = injector
