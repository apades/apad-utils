import { initClient } from '@apad/injector/client'
import type { PlasmoCSConfig } from 'plasmo'
import { injectorConfig } from '../config'

window.injector = initClient(injectorConfig)
console.log('window.injector', window.injector)

export const config: PlasmoCSConfig = {
  matches: ['<all_urls>'],
  run_at: 'document_start',
  all_frames: true,
}
