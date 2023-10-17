import { isString } from '@pkgs/utils/src/utils'
import InjectorBase, { InjectorBaseProps } from '../../core/base'
import { DOM_EVENTS } from './types'
import { noop } from '@pkgs/tsconfig/types/global'
import { dq1 } from '@pkgs/utils/src/dom'

type injectEv = {
  originalRemove: (k: string, fn: noop, ...more: any[]) => void
  originalAdd: (k: string, fn: noop, ...more: any[]) => void
}

type objEv = {
  addEventListener: (k: string, fn: noop, ...more: any[]) => void
  removeEventListener: (k: string, fn: noop, ...more: any[]) => void
}
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

    function recoverEv<T extends objEv>(tar: T, re: injectEv) {
      tar.addEventListener = re.originalAdd
      tar.removeEventListener = re.originalRemove
    }
    recoverEv(window, this.winEv)
    recoverEv(document, this.docEv)
    recoverEv(HTMLElement.prototype, this.domEv)
    this.winEv = null
    this.docEv = null
    this.domEv = null
  }

  protected domEv: injectEv
  protected docEv: injectEv
  protected winEv: injectEv
  protected onEventAddMap: Record<string, string[]>
  protected onEventRemoveMap: Record<string, string[]>
  protected disableMap: Record<string, string[]>
  protected injectSysAPI() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const base = this
    const onEventAddMap = this.onEventAddMap
    const onEventRemoveMap = this.onEventRemoveMap
    const disableMap = this.disableMap

    function injectEventListener<T extends objEv>(tar: T) {
      let originalAdd = tar.addEventListener
      let originalRemove = tar.removeEventListener

      const isDocOrWin = (key: string) =>
        ((tar as any) == window && key == 'window') ||
        ((tar as any) == document && key == 'document')
      let addEventListener = function (...val: any) {
        let _this = this ?? tar
        this.eventMap = _this.eventMap || {}
        this.eventMap[val[0]] = _this.eventMap[val[0]] || []
        let eventList = _this.eventMap[val[0]]
        let event = val[0]

        try {
          // 判断监听触发事件
          let onEventMatch = Object.entries(onEventAddMap).find(
            ([key, val]) => isDocOrWin(key) || _this.matches?.(key)
          )
          if (onEventMatch && onEventMatch[1].includes(event)) {
            base.send('eventAdd', {
              qs: onEventMatch[0],
              event,
            })
          }

          let disableMatch = Object.entries(disableMap).find(
            ([key, val]) => isDocOrWin(key) || _this.matches?.(key)
          )
          // 判断是否禁用
          if (disableMatch && disableMatch[1].includes(event)) {
            console.log('匹配到禁用query', disableMap, _this)
          } else var rs = originalAdd.call(_this, ...val)
          eventList.push({
            fn: val[1],
            state: val[2],
          })
        } catch (error) {
          console.error(error)
        }
        return rs
      }
      let removeEventListener = function (...val: any) {
        let _this = this ?? tar
        let eventList = _this.eventMap?.[val[0]] ?? []
        try {
          var rs = originalRemove.call(_this, ...val)
          let index = eventList.findIndex(
            (ev: any) => ev.fn === val[1] && ev.state == val[2]
          )
          eventList.splice(index, 1)
        } catch (error) {
          console.error(error)
        }
        return rs
      }

      tar.addEventListener = addEventListener
      tar.removeEventListener = removeEventListener

      return {
        originalRemove,
        originalAdd,
      }
    }
    this.domEv = injectEventListener(HTMLElement.prototype)
    this.docEv = injectEventListener(document)
    this.winEv = injectEventListener(window)
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

  enableEvent(qs: HTMLElement | Window | Document | string, event: string) {
    console.log('开始启用事件', qs, event)
    const isWindow = qs == 'window' || qs == window,
      isDoc = qs == 'document' || qs == document,
      checkDisableMap = isString(qs)

    if (checkDisableMap) {
      if (!this.disableMap[qs]) return false
      this.disableMap[qs].slice(
        this.disableMap[qs].findIndex((e) => e == event),
        1
      )
    }

    function addEv(tar: any, fn: noop) {
      let eventList = (tar as any).eventMap?.[event] ?? []
      eventList.forEach((ev: any) => {
        if (ev.state) fn.call(tar, event, ev.fn, ev.state)
        else fn.call(tar, event, ev.fn)
      })
    }

    if (isWindow) {
      addEv(window, this.winEv.originalAdd)
    } else if (isDoc) {
      addEv(document, this.docEv.originalAdd)
    } else {
      const el = checkDisableMap ? dq1(qs) : qs
      if (!el)
        return console.warn(`没有找到${qs}的dom，将会在后续dom添加时不给add`)
      addEv(el, this.domEv.originalAdd)
    }
    return true
  }

  disableEvent(qs: HTMLElement | Window | Document | string, event: string) {
    console.log('开始禁用事件', qs, event)
    const isWindow = qs == 'window' || qs == window,
      isDoc = qs == 'document' || qs == document,
      checkDisableMap = isString(qs)

    if (checkDisableMap) {
      this.disableMap[qs] = this.disableMap[qs] || []
      this.disableMap[qs].push(event)
    }

    function rmEv(tar: any, fn: noop) {
      let eventList = (tar as any).eventMap?.[event] ?? []
      eventList.forEach((ev: any) => {
        if (ev.state) fn.call(tar, event, ev.fn, ev.state)
        else fn.call(tar, event, ev.fn)
      })
    }

    if (isWindow) {
      rmEv(window, this.winEv.originalRemove)
    } else if (isDoc) {
      rmEv(document, this.docEv.originalRemove)
    } else {
      const el = checkDisableMap ? dq1(qs) : qs
      rmEv(el, this.domEv.originalRemove)
    }
  }
}
