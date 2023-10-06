import { Messager } from '../../core/Messager'
import InjectorBase, { InjectorBaseProps } from '../../core/base'
import { InjectorEventType } from '../../core/enmu'
import DomEventsClient from '../domEvents/client'
import EvalClient from '../eval/client'
import FetchClient from '../fetch/client'
import TriggerEventsClient from '../triggerEvents/client'
import { ENTRY, InitConfig } from './types'

const sendType = InjectorEventType.listenType,
  listenType = InjectorEventType.sendType

const messager = new Messager({ listenType, sendType })
const injector = {
  eval: new EvalClient({ messager }),
  domEvents: new DomEventsClient({ messager }),
  fetch: new FetchClient({ messager }),
  triggerEvents: new TriggerEventsClient({ messager }),
}

export default injector

export class EntryClient extends InjectorBase {
  static _EntryClient: EntryClient
  constructor(props: InjectorBaseProps & { featConfig: InitConfig }) {
    if (!EvalClient._EvalClient) {
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
  protected loadedFeatMap: Map<string, InjectorBase>
  initFeats(initConfig: InitConfig) {}
  updateFeats(newFeatConfig: InitConfig) {
    this.featConfig = newFeatConfig
  }
}
