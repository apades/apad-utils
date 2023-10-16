import { omit } from '@pkgs/utils/src/utils'
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
    visibilityState: null,
    tab: (tabId: number) => {
      messager.tabId = tabId
      const messagerSendMsgMethod = messager.sendMessage.bind(messager)
      messager.sendMessage = function (...args: [any]) {
        const promise = messagerSendMsgMethod(...args)
        messager.tabId = null
        return promise.then((res: any) => {
          messager.sendMessage = messagerSendMsgMethod
          return res
        })
      }.bind(messager)
      return proxy
    },
  } as ClientMap & { config: EntryClient; tab: (tabId: number) => void }
  const proxy = new Proxy(proxyTar, {
    get(target, key: string, receiver) {
      if (key == 'config') return entryClient
      if (key == 'tab') {
        return proxyTar.tab
      }
      const tar = entryClient.loadedFeatMap.get(key)
      if (!tar)
        throw Error(`没有挂载${key}功能，请update或者initClient传入该功能`)
      return tar
    },
  })

  return proxy
}
