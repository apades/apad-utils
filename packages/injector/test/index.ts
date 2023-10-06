import { onWindowLoad } from '@pkgs/utils/src/utils'
import injector from '../src/feats/entry/client'
import { initInjector } from '../src/feats/entry/injector'
import { dq1 } from '@pkgs/utils/src/dom'

window.injectorServer = initInjector()

window.injector = injector

onWindowLoad().then(() => {
  dq1('#aaa').addEventListener('click', () => {
    console.log('click aaa')
  })
})
