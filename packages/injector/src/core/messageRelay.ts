import EntryClient, { ClientMap } from '../feats/entry/client'
import { FeatEntryInitConfig } from '../feats/entry/types'
import { Messager } from './Messager'
import { InjectorEventType } from './enmu'

export type MessageRelayProps = {
  onMessageFromClient: (msg: any) => Promise<void>
  onMessageFromInjector: (msg: any) => Promise<void>
  sendMessageToClient: (msg: any) => Promise<void>
  sendMessageToInjector: (msg: any) => Promise<void>
}

export function initMessageReplay(
  props: MessageRelayProps & FeatEntryInitConfig
) {
  const sendType = InjectorEventType.listenType,
    listenType = InjectorEventType.sendType
  const messager = new Messager({ listenType, sendType })
  const entryClient = new EntryClient({ messager, featConfig: props })
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
