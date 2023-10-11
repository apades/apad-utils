import { initInjector } from '@apad/injector/injector'
import type { PlasmoCSConfig } from 'plasmo'
import { injectorConfig } from '../config'

window.injectorService = initInjector(injectorConfig)
console.log('window.injectorService', window.injectorService)

export const config: PlasmoCSConfig = {
  matches: ['<all_urls>'],
  world: 'MAIN',
  run_at: 'document_start',
  all_frames: true,
}
