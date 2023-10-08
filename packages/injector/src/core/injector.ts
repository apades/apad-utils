import EntryInjector, { InjectorMap } from '../feats/entry/injector'
import { InitConfig } from '../feats/entry/types'
import { InjectorEventType } from './enmu'
import { Messager } from './Messager'

export function initInjector(config?: InitConfig) {
  const sendType = InjectorEventType.sendType,
    listenType = InjectorEventType.listenType
  const messager = new Messager({ listenType, sendType })
  const entryInjector = new EntryInjector({ messager, featConfig: config })
  entryInjector.init()

  const proxyTar = {
    domEvents: null,
    eval: null,
    fetch: null,
    route: null,
    triggerEvents: null,
    config: null,
  } as InjectorMap & { config: EntryInjector }
  const proxy = new Proxy(proxyTar, {
    get(target, key: string, receiver) {
      if (key == 'config') return entryInjector
      const tar = entryInjector.loadedFeatMap.get(key)
      if (!tar)
        throw Error(`没有挂载${key}功能，请update或者initInjector传入该功能`)
      return tar
    },
  })

  return proxy
}
