import { initClient } from '@pkgs/injector/src/core/client'
import Messager from '@pkgs/injector/src/core/ext-bg-messager/background'
import { injectorConfig } from './config'
const injector = initClient({
  ...injectorConfig,
  Messager,
})
;(globalThis as any).injector = injector

chrome.tabs.query({ active: true }).then((tabs) => {
  console.log('tabs', tabs)
  ;(injector.domEvents as any).messager.tabId = tabs[0].id
})
