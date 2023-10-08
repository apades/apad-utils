import { TypeOfMapToInstanceTypeMap } from '../../../../tsconfig/types/global'
import InjectorBase, { InjectorBaseProps } from '../../core/base'
import DomEventsInjector from '../domEvents/injector'
import EvalInjector from '../eval/injector'
import FetchInjector from '../fetch/injector'
import RouteInjector from '../route/injector'
import TriggerEventsInjector from '../triggerEvents/injector'
import { ENTRY, InitConfig } from './types'

export const configToInjectorMap = {
  domEvents: DomEventsInjector,
  fetch: FetchInjector,
  route: RouteInjector,
  eval: EvalInjector,
  triggerEvents: TriggerEventsInjector,
}

export type InjectorMap = TypeOfMapToInstanceTypeMap<typeof configToInjectorMap>

export default class EntryInjector extends InjectorBase {
  static _EntryInjector: EntryInjector
  constructor(props: InjectorBaseProps & { featConfig?: InitConfig }) {
    if (!EntryInjector._EntryInjector) {
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
    this.initMsgEvents()
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

  protected initMsgEvents() {
    this.on('updateFeats', (data) => {
      return this.updateFeats(data.newFeatConfig)
    })
  }
}
