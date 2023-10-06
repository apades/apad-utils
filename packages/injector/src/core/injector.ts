import EntryInjector from '../feats/entry/injector'
import { InitConfig } from '../feats/entry/types'
import { InjectorEventType } from './enmu'
import { Messager } from './Messager'

export function initInjector(config?: InitConfig) {
  const sendType = InjectorEventType.sendType,
    listenType = InjectorEventType.listenType
  const messager = new Messager({ listenType, sendType })
  this.messager = messager

  const entryInjector = new EntryInjector({ messager, featConfig: config })

  entryInjector.loadedFeatMap.get('key')
}
