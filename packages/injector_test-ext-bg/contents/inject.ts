import { initInjector } from '@pkgs/injector/src/core/injector'
import type { PlasmoCSConfig } from 'plasmo'
import { injectorConfig } from '../config'
import {
  setNamespace,
  sendMessage,
  onMessage,
} from '../node_modules/webext-bridge/dist/window'

setNamespace('main')
;(globalThis as any).sendMsg = async (type: string, data: any) =>
  sendMessage(type, data, 'background')

onMessage('on-window', (data) => {
  console.log('on-window', data)
})

// window.injectorService = initInjector(injectorConfig)
// console.log('window.injectorService', window.injectorService)

export const config: PlasmoCSConfig = {
  matches: ['<all_urls>'],
  world: 'MAIN',
  run_at: 'document_start',
  all_frames: true,
}
