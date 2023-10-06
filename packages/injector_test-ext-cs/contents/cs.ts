import type { PlasmoCSConfig } from 'plasmo'
import injector from '@pkgs/injector/src/feats/entry/client'

window.clientInjector = injector

export const config: PlasmoCSConfig = {
  matches: ['<all_urls>'],
  run_at: 'document_start',
  all_frames: true,
}
