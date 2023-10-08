import { isString } from '@pkgs/utils/src/utils'
import InjectorBase, { InjectorBaseProps } from '../../core/base'
import {
  KeyboardEvents,
  KeyboardTrigger,
  MouseEvents,
  MouseTrigger,
  TRIGGER_EVENTS,
} from './types'
import { dq1 } from '@pkgs/utils/src/dom'

type IntervalObj = { interval: NodeJS.Timeout; uuid: string }
export default class TriggerEventsInjector extends InjectorBase {
  static _TriggerEventsInjector: TriggerEventsInjector
  constructor(props: InjectorBaseProps) {
    if (!TriggerEventsInjector._TriggerEventsInjector) {
      super({
        category: TRIGGER_EVENTS,
        ...props,
      })
      TriggerEventsInjector._TriggerEventsInjector = this
    }
    return TriggerEventsInjector._TriggerEventsInjector
  }
  init(): void {
    this.activeIntervals = new Map()
    this.initTriggerFunctions(MouseEvents, MouseEvent)
    this.initTriggerFunctions(KeyboardEvents, KeyboardEvent)

    this.initMsgEvents(MouseEvents, this.mouse)
    this.initMsgEvents(KeyboardEvents, this.keyboard)
  }
  protected onUnmount(): void {
    ;[...this.activeIntervals.keys()].forEach((interval) => {
      if (isString(interval)) return
      clearInterval(interval.interval)
    })

    this.activeIntervals = null
    this.mouse = null
    this.keyboard = null
  }

  mouse: MouseTrigger
  keyboard: KeyboardTrigger

  protected activeIntervals: Map<IntervalObj | string, string | IntervalObj>
  protected initTriggerFunctions<
    E extends typeof MouseEvents | typeof KeyboardEvents,
    EC extends typeof MouseEvent | typeof KeyboardEvent
  >(events: E, eventClass: EC) {
    let rs: any = {}
    for (const event in events) {
      rs[event] = (el: HTMLElement | string, ext?: any) => {
        if (isString(el)) el = dq1<HTMLElement>(el)
        if (!el) return console.warn('找不到el', el)

        el.dispatchEvent(new eventClass(event, ext))
      }

      rs[event].interval = (
        el: HTMLElement | string,
        ext?: any,
        option?: number
      ) => {
        const _el = isString(el) ? dq1<HTMLElement>(el) : el
        if (!_el) return console.warn('找不到el', el)

        const interval = setInterval(() => {
          _el.dispatchEvent(new eventClass(event, ext))
        }, option ?? 100)
        const uuid = new Date().getTime() + ''

        const activeInterval = { interval, uuid }
        this.activeIntervals.set(activeInterval, uuid)
        this.activeIntervals.set(uuid, activeInterval)

        const cb = () => {
          clearInterval(interval)
          this.activeIntervals.delete(activeInterval)
          this.activeIntervals.delete(uuid)
        }
        cb.uuid = uuid
        return cb
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

  protected initMsgEvents<E extends typeof MouseEvents | typeof KeyboardEvents>(
    events: E,
    tar: any
  ) {
    for (const event in events) {
      this.on(event, (data) => {
        tar[event](data.el, data.ext)
      })
      this.on(`${event}-interval`, (data) => {
        return tar[event].interval(data.el, data.ext, data.option).uuid
      })
      this.on(`${event}-interval-stop`, (data) => {
        const interval = this.activeIntervals.get(data.uuid) as IntervalObj
        if (!interval)
          return console.warn('没有找到对应的interval uuid', data.uuid)

        clearInterval(interval.interval)
        this.activeIntervals.delete(interval)
        this.activeIntervals.delete(data.uuid)
      })
    }
  }
}
