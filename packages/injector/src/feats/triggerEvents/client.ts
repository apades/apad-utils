import type { InjectorBaseProps } from '../../core/base'
import type {
  KeyboardTrigger,
  MouseTrigger,
} from './types'
import { AsyncLock } from '@pkgs/utils/main'
import InjectorBase from '../../core/base'
import {
  KeyboardEvents,
  MouseEvents,
  TRIGGER_EVENTS,
} from './types'

export default class TriggerEventsClient extends InjectorBase {
  static _TriggerEventsClient: TriggerEventsClient
  constructor(props: InjectorBaseProps) {
    if (!TriggerEventsClient._TriggerEventsClient) {
      super({
        category: TRIGGER_EVENTS,
        ...props,
      })
      TriggerEventsClient._TriggerEventsClient = this
    }
    return TriggerEventsClient._TriggerEventsClient
  }

  init(): void {
    this.initTriggerFunctions(MouseEvents)
    this.initTriggerFunctions(KeyboardEvents)
  }

  protected onUnmount(): void {
    this.mouse = null
    this.keyboard = null
  }

  /** 插件cs到world是传不了dom的 */
  mouse: MouseTrigger<string>
  keyboard: KeyboardTrigger<string>

  protected initTriggerFunctions<
    E extends typeof MouseEvents | typeof KeyboardEvents,
  >(events: E,
  ) {
    const rs: any = {}
    for (const event in events) {
      rs[event] = (el: string, ext?: any) => {
        this.send(event, { el, ext })
      }

      rs[event].interval = (el: string, ext?: any, option?: number) => {
        const lock = new AsyncLock()
        let uuid: string

        this.send(`${event}-interval`, { el, ext, option }).then((res) => {
          uuid = res
          lock.ok()
        })
        return async () => {
          await lock.waiting()
          this.send(`${event}-interval-stop`, { uuid })
        }
      }
    }

    switch (events) {
      case MouseEvents: {
        this.mouse = rs
        break
      }
      case KeyboardEvents: {
        this.keyboard = rs
        break
      }
    }
  }
}
