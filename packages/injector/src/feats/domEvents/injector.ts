import { isString } from '@pkgs/utils/src/utils'
import InjectorBase, { InjectorBaseProps } from '../../core/base'
import { DOM_EVENTS } from './types'

export default class DomEventsInjector extends InjectorBase {
  static _DomEventsInjector: DomEventsInjector
  constructor(props: InjectorBaseProps) {
    if (!DomEventsInjector._DomEventsInjector) {
      super({
        category: DOM_EVENTS,
        ...props,
      })
      DomEventsInjector._DomEventsInjector = this
    }
    return DomEventsInjector._DomEventsInjector
  }

  init(): void {
    this.onEventAddMap = {}
    this.onEventRemoveMap = {}
    this.disableMap = {}
    this.originAddEventListener = HTMLElement.prototype.addEventListener
    this.originRemoveEventListener = HTMLElement.prototype.removeEventListener

    this.initMsgEvents()
    this.injectSysAPI()
  }
  onUnmount(): void {
    Object.entries(this.disableMap).map(([qs, events]) => {
      events.forEach((event) => this.enableEvent(qs, event))
    })
    this.onEventAddMap = null
    this.onEventRemoveMap = null
    this.disableMap = null

    HTMLElement.prototype.addEventListener = this.originAddEventListener
    HTMLElement.prototype.removeEventListener = this.originRemoveEventListener
  }

  protected originAddEventListener: typeof HTMLElement.prototype.addEventListener
  protected originRemoveEventListener: typeof HTMLElement.prototype.removeEventListener
  protected onEventAddMap: Record<string, string[]>
  protected onEventRemoveMap: Record<string, string[]>
  protected disableMap: Record<string, string[]>
  protected injectSysAPI() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const base = this

    const onEventAddMap = this.onEventAddMap
    const onEventRemoveMap = this.onEventRemoveMap
    const disableMap = this.disableMap

    const originalAdd = HTMLElement.prototype.addEventListener

    HTMLElement.prototype.addEventListener = function (...val: any) {
      this.eventMap = this.eventMap || {}
      this.eventMap[val[0]] = this.eventMap[val[0]] || []
      let eventList = this.eventMap[val[0]]
      let event = val[0]
      try {
        // 判断监听触发事件
        let onEventMatch = Object.entries(onEventAddMap).find(([key, val]) =>
          this.matches?.(key)
        )
        if (onEventMatch && onEventMatch[1].includes(event)) {
          base.send('eventAdd', { qs: onEventMatch[0], event })
        }

        let disableMatch = Object.entries(disableMap).find(([key, val]) =>
          this.matches?.(key)
        )
        // 判断是否禁用
        if (disableMatch && disableMatch[1].includes(event)) {
          console.log('匹配到禁用query', disableMap, this)
        } else {
          var rs = originalAdd.call(this, ...val)
        }

        eventList.push({
          fn: val[1],
          state: val[2],
        })
      } catch (error) {
        console.error(error)
      }
      return rs
    }

    const originalRemove = HTMLElement.prototype.removeEventListener

    HTMLElement.prototype.removeEventListener = function (...val: any) {
      let eventList = this.eventMap?.[val[0]] ?? []
      let event = val[0]

      try {
        // 判断监听触发事件
        // let onEventMatch = Object.entries(onEventRemoveMap).find(([key, val]) =>
        //   this.matches?.(key)
        // )
        // if (onEventMatch && onEventMatch[1].includes(event)) {
        //   base.send('eventRemove', { qs: onEventMatch[0], event })
        // }

        var rs = originalRemove.call(this, ...val)
        let index = eventList.findIndex(
          (ev: any) => ev.fn === val[1] && ev.state == val[2]
        )
        eventList.splice(index, 1)
      } catch (error) {
        console.error(error)
      }
      return rs
    }
  }
  protected initMsgEvents() {
    this.on('disable', (data: any) => {
      const { qs, event } = data
      this.disableEvent(qs, event)
    })

    this.on('enable', (data) => {
      const { qs, event } = data

      this.enableEvent(qs, event)
    })

    // this.on('onEventAdd', (data) => {
    //   const { qs, event } = data
    //   this.onEventAddMap[qs] = this.onEventAddMap[qs] || []
    //   this.onEventAddMap[qs].push(event)
    // })
    // this.on('offEventAdd', (data) => {
    //   const { qs, event } = data
    //   this.onEventAddMap[qs] = this.onEventAddMap[qs] || []
    //   this.onEventAddMap[qs].slice(
    //     this.onEventAddMap[qs].findIndex((_qs) => _qs == qs),
    //     1
    //   )
    // })

    // this.on('onEventRemove', (data) => {
    //   const { qs, event } = data
    //   this.onEventRemoveMap[qs] = this.onEventRemoveMap[qs] || []
    //   this.onEventRemoveMap[qs].push(event)
    // })
    // this.on('offEventREmove', (data) => {
    //   const { qs, event } = data
    //   this.onEventRemoveMap[qs] = this.onEventRemoveMap[qs] || []
    //   this.onEventRemoveMap[qs].slice(
    //     this.onEventRemoveMap[qs].findIndex((_qs) => _qs == qs),
    //     1
    //   )
    // })
  }

  enableEvent(qs: HTMLElement | string, event: string) {
    console.log('开始启用事件', qs, event)
    if (isString(qs)) {
      const el = document.querySelector(qs)

      if (!this.disableMap[qs]) return false
      this.disableMap[qs].slice(
        this.disableMap[qs].findIndex((e) => e == event),
        1
      )

      let eventList = (el as any).eventMap?.[event] ?? []
      eventList.forEach((ev: any) => {
        if (ev.state)
          this.originAddEventListener.call(el, event, ev.fn, ev.state)
        else this.originAddEventListener.call(el, event, ev.fn)
      })
      return true
    } else {
      let el = qs
      let eventList = (el as any).eventMap?.[event] ?? []
      eventList.forEach((ev: any) => {
        if (ev.state)
          this.originAddEventListener.call(el, event, ev.fn, ev.state)
        else this.originAddEventListener.call(el, event, ev.fn)
      })
      return true
    }
  }

  disableEvent(qs: HTMLElement | string, event: string) {
    console.log('开始禁用事件', qs, event)
    if (isString(qs)) {
      const el = document.querySelector(qs)

      this.disableMap[qs] = this.disableMap[qs] || []
      this.disableMap[qs].push(event)

      if (!el)
        return console.warn(`没有找到${qs}的dom，将会在后续dom添加时不给add`)
      let eventList = (el as any).eventMap?.[event] ?? []

      eventList.forEach((ev: any) => {
        if (ev.state)
          this.originRemoveEventListener.call(el, event, ev.fn, ev.state)
        else this.originRemoveEventListener.call(el, event, ev.fn)
      })
    } else {
      let el = qs
      let eventList = (el as any).eventMap?.[event] ?? []

      eventList.forEach((ev: any) => {
        if (ev.state)
          this.originRemoveEventListener.call(el, event, ev.fn, ev.state)
        else this.originRemoveEventListener.call(el, event, ev.fn)
      })
    }
  }
}
