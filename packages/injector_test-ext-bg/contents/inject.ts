import { initInjector } from '@apad/injector/injector'
import Messager from '@apad/injector/ext-bg-messager/window'
import type { PlasmoCSConfig } from 'plasmo'
import { injectorConfig } from '../config'

window.injectorService = initInjector({ ...injectorConfig, Messager })

export const config: PlasmoCSConfig = {
  matches: ['<all_urls>'],
  world: 'MAIN',
  run_at: 'document_start',
  all_frames: true,
}
