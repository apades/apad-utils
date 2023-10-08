import { Rec, noop } from '@pkgs/tsconfig/types/global'
import InjectorBase, { InjectorBaseProps } from '../../core/base'
import { DOM_EVENTS } from './types'

export default class DomEventsClient extends InjectorBase {
  static _DomEventsClient: DomEventsClient
  constructor(props: InjectorBaseProps) {
    if (!DomEventsClient._DomEventsClient) {
      super({
        category: DOM_EVENTS,
        ...props,
      })
      DomEventsClient._DomEventsClient = this
    }
    return DomEventsClient._DomEventsClient
  }

  init(): void {
    this.addCallbackMap = new Map()
    this.rmCallbackMap = new Map()
  }
  protected onUnmount(): void {
    ;[...this.addCallbackMap.values()].forEach((cb) => {
      this.off('eventAdd', cb)
    })
    ;[...this.rmCallbackMap.values()].forEach((cb) => {
      this.off('eventRemove', cb)
    })

    this.addCallbackMap = null
    this.rmCallbackMap = null
  }

  /**禁用一个dom的event，可以通过enableEvent重新启用 */
  disableEvent(qs: string, event: string) {
    return this.send('disable', { qs, event })
  }
  /**重新启用经过disableEvent禁用的dom的事件 */
  enableEvent(qs: string, event: string) {
    return this.send('enable', { qs, event })
  }

  protected addCallbackMap: Map<noop, noop>
  /**在添加事件时触发 */
  //   async onEventAdd(qs: string, callback: (event: string) => void) {
  //     const newCb = (data: any) => {
  //       if (data.qs != qs) return
  //       callback(data.event)
  //     }
  //     this.addCallbackMap.set(callback, newCb)
  //     this.on('eventAdd', newCb)
  //   }
  //   async offEventAdd(callback: (event: string) => void) {
  //     const newCb = this.addCallbackMap.get(callback)
  //     if (!newCb) throw Error('addCallbackMap中不存在callback')
  //     this.off('eventAdd', newCb)
  //   }

  protected rmCallbackMap: Map<noop, noop>
  /**在移除事件时触发 */
  //   async onEventRemove(qs: string, callback: (event: string) => void) {
  //     const newCb = (data: any) => {
  //       if (data.qs != qs) return
  //       callback(data.event)
  //     }
  //     this.rmCallbackMap.set(callback, newCb)
  //     this.on('eventAdd', newCb)
  //   }
  //   async offEventRemove(callback: (event: string) => void) {
  //     const newCb = this.rmCallbackMap.get(callback)
  //     if (!newCb) throw Error('addCallbackMap中不存在callback')
  //     this.off('eventAdd', newCb)
  //   }
}
