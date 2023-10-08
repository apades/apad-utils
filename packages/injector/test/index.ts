import { onWindowLoad } from '@pkgs/utils/src/utils'
import { initInjector } from '../src/core/injector'
import { dq1 } from '@pkgs/utils/src/dom'
import { initClient } from '../src/core/client'

window.injectorServer = initInjector({ eval: true, domEvents: true })

window.injector = initClient({ eval: true, domEvents: true })

onWindowLoad().then(() => {
  dq1('#aaa').addEventListener('click', () => {
    console.log('click aaa')
  })
})
