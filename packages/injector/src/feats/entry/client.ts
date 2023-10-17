import AsyncLock from '@pkgs/utils/src/AsyncLock'
import { TypeOfMapToInstanceTypeMap } from '../../../../tsconfig/types/global'
import InjectorBase, { InjectorBaseProps } from '../../core/base'
import DomEventsClient from '../domEvents/client'
import EvalClient from '../eval/client'
import FetchClient from '../fetch/client'
import RouteClient from '../route/client'
import TriggerEventsClient from '../triggerEvents/client'
import VisibilityStateClient from '../visibilityState/client'
import { ENTRY, FeatEntryInitConfig } from './types'

export const configToClientMap = {
  domEvents: DomEventsClient,
  fetch: FetchClient,
  route: RouteClient,
  eval: EvalClient,
  triggerEvents: TriggerEventsClient,
  visibilityState: VisibilityStateClient,
}
export type ClientMap = TypeOfMapToInstanceTypeMap<typeof configToClientMap>

export default class EntryClient extends InjectorBase {
  static _EntryClient: EntryClient
  injectorLoadedLock: AsyncLock
  constructor(props: InjectorBaseProps & { featConfig: FeatEntryInitConfig }) {
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
    this.injectorLoadedLock = new AsyncLock()
    this.initFeats(this.featConfig)

    this.waitInjectorLoad()
  }
  protected onUnmount(): void {
    this.loadedFeatMap = null
  }

  waitInjectorLoad() {
    // this.messager.sendMessage('load')
    // const handleLoad = () => {
    //   console.log('injector load', document.head, document.body)
    //   this.injectorLoadedLock.ok()
    //   this.messager.offMessage('load', handleLoad)
    // }
    // this.messager.onMessage('load', handleLoad)
  }
  protected featConfig: FeatEntryInitConfig
  loadedFeatMap: Map<string, InjectorBase>
  initFeats(initConfig: FeatEntryInitConfig) {
    this.updateFeats(initConfig)
  }
  async updateFeats(newFeatConfig: FeatEntryInitConfig) {
    // await this.injectorLoadedLock.waiting()
    await this.send('updateFeats', { newFeatConfig })
    this.featConfig = newFeatConfig

    Object.entries(newFeatConfig).forEach(
      ([key, val]: [keyof FeatEntryInitConfig, boolean]) => {
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
