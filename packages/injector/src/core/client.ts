import { omit } from 'lodash'
import EntryClient, { ClientMap } from '../feats/entry/client'
import { InjectorInitConfig } from '../feats/entry/types'
import { InjectorEventType } from './enmu'
import { Messager } from './Messager'

export function initClient(config?: InjectorInitConfig) {
  const sendType = InjectorEventType.listenType,
    listenType = InjectorEventType.sendType
  const messager = config.Messager
    ? new config.Messager({ listenType, sendType })
    : new Messager({ listenType, sendType })

  const entryClient = new EntryClient({
    messager,
    featConfig: omit(config, ['Messager']),
  })
  entryClient.init()

  const proxyTar = {
    domEvents: null,
    eval: null,
    fetch: null,
    route: null,
    triggerEvents: null,
    config: null,
  } as ClientMap & { config: EntryClient }
  const proxy = new Proxy(proxyTar, {
    get(target, key: string, receiver) {
      if (key == 'config') return entryClient
      const tar = entryClient.loadedFeatMap.get(key)
      if (!tar)
        throw Error(`没有挂载${key}功能，请update或者initClient传入该功能`)
      return tar
    },
  })

  return proxy
}
