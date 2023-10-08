import { TypeOfMapToInstanceTypeMap } from '../../../../tsconfig/types/global'
import InjectorBase, { InjectorBaseProps } from '../../core/base'
import DomEventsClient from '../domEvents/client'
import EvalClient from '../eval/client'
import FetchClient from '../fetch/client'
import RouteClient from '../route/client'
import TriggerEventsClient from '../triggerEvents/client'
import { ENTRY, InitConfig } from './types'

export const configToClientMap = {
  domEvents: DomEventsClient,
  fetch: FetchClient,
  route: RouteClient,
  eval: EvalClient,
  triggerEvents: TriggerEventsClient,
}
export type ClientMap = TypeOfMapToInstanceTypeMap<typeof configToClientMap>

export default class EntryClient extends InjectorBase {
  static _EntryClient: EntryClient
  constructor(props: InjectorBaseProps & { featConfig: InitConfig }) {
    if (!EntryClient._EntryClient) {
      super({
        category: ENTRY,
        ...props,
      })
      EntryClient._EntryClient = this
    }
    return EntryClient._EntryClient
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
  async updateFeats(newFeatConfig: InitConfig) {
    await this.send('updateFeats', { newFeatConfig })
    this.featConfig = newFeatConfig

    Object.entries(newFeatConfig).forEach(
      ([key, val]: [keyof InitConfig, boolean]) => {
        const existFeats = this.loadedFeatMap.get(key)
        if (!existFeats && val) {
          const feat = new configToClientMap[key]({ messager: this.messager })
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
