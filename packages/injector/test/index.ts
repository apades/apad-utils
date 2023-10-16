import { onWindowLoad } from '@pkgs/utils/src/utils'
import { initInjector } from '../src/core/injector'
import { dq1 } from '@pkgs/utils/src/dom'
import { initClient } from '../src/core/client'
import { FeatEntryInitConfig } from '../src/feats/entry/types'

const config: FeatEntryInitConfig = {
  eval: true,
  domEvents: true,
  triggerEvents: true,
  fetch: true,
  route: true,
  visibilityState: true,
}
window.injectorServer = initInjector(config)

window.injector = initClient(config)

onWindowLoad().then(() => {
  dq1('#aaa').addEventListener('click', () => {
    console.log('click aaa')
  })

  window.addEventListener('click', () => {
    console.log('window')
  })
  document.addEventListener('click', () => {
    console.log('document')
  })

  document.addEventListener('visibilitychange', () => {
    console.log('visibilitychange', document.visibilityState)
  })
})
