import { Messager, createMessager } from '../../core/Messager'
import InjectorBase, { InjectorBaseProps } from '../../core/base'
import { InjectorEventType } from '../../core/enmu'
import DomEventsInjector from '../domEvents/injector'
import EvalClient from '../eval/client'
import EvalInjector from '../eval/injector'
import FetchInjector from '../fetch/injector'
import RouteInjector from '../route/injector'
import TriggerEventsInjector from '../triggerEvents/injector'
import { ENTRY, InitConfig } from './types'

export function initInjector(config?: InitConfig) {
  const sendType = InjectorEventType.sendType,
    listenType = InjectorEventType.listenType
  const messager = new Messager({ listenType, sendType })

  return {
    eval: new EvalInjector({ messager }),
    domEvents: new DomEventsInjector({ messager }),
    fetch: new FetchInjector({ messager }),
    triggerEvents: new TriggerEventsInjector({ messager }),
  }
}

const configToInjectorMap = {
  domEvents: DomEventsInjector,
  fetch: FetchInjector,
  route: RouteInjector,
  eval: EvalInjector,
  triggerEvents: TriggerEventsInjector,
}

export default class EntryInjector extends InjectorBase {
  static _EntryInjector: EntryInjector
  constructor(props: InjectorBaseProps & { featConfig?: InitConfig }) {
    if (!EvalClient._EvalClient) {
      super({
        category: ENTRY,
        ...props,
      })
      this.featConfig = this.featConfig ?? {}
      EntryInjector._EntryInjector = this
    }
    return EntryInjector._EntryInjector
  }
  init(): void {
    this.loadedFeatMap = new Map()
    this.initFeats(this.featConfig)
  }
  protected onUnmount(): void {}

  protected featConfig: InitConfig
  loadedFeatMap: Map<string, InjectorBase>
  initFeats(initConfig: InitConfig) {
    this.updateFeats(initConfig)
  }
  updateFeats(newFeatConfig: InitConfig) {
    this.featConfig = newFeatConfig

    Object.entries(newFeatConfig).forEach(
      ([key, val]: [keyof InitConfig, boolean]) => {
        const existFeats = this.loadedFeatMap.get(key)
        if (!existFeats && val) {
          const feat = new configToInjectorMap[key]({ messager: this.messager })
          feat.init()
          this.loadedFeatMap.set(key, feat)
          return
        }

        if (existFeats && !val) {
          existFeats.unmount()
          this.loadedFeatMap.delete(key)
          return
        }
      }
    )
  }
}
