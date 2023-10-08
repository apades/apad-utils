import { initClient } from '@pkgs/injector/src/core/client'
import type { PlasmoCSConfig } from 'plasmo'
import { injectorConfig } from '../config'
import { allowWindowMessaging } from '../node_modules/webext-bridge/dist/content-script'

allowWindowMessaging('main')
// window.injector = initClient(injectorConfig)
// console.log('window.injector', window.injector)

export const config: PlasmoCSConfig = {
  matches: ['<all_urls>'],
  run_at: 'document_start',
  all_frames: true,
}
