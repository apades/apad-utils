import type { PlasmoCSConfig } from 'plasmo'
import { initInjector } from '@pkgs/injector/src/feats/entry/injector'

window.injector = initInjector()

export const config: PlasmoCSConfig = {
  matches: ['<all_urls>'],
  world: 'MAIN',
  run_at: 'document_start',
  all_frames: true,
}
