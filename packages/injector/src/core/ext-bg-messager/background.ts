import {
  onMessage,
  sendMessage,
} from '../../../node_modules/webext-bridge/dist/background'
import { Messager, MessagerProps, ProtocolWithReturn } from '../Messager'

export default class WindowMessager<
  TProtocolMap = Record<string, ProtocolWithReturn<any, any>>
> extends Messager<TProtocolMap> {
  eventTarget = new EventTarget()
  props: MessagerProps
  cbMap = new Map<Function, Function>()

  protected protocolListenMessager() {
    // 这里回应window怎么办
    onMessage(this.props.listenType, (res) => {
      // console.log('onMessage', res)
      const data = res.data as any
      this.eventTarget.dispatchEvent(
        new CustomEvent(data.type, {
          detail: { data: data.data, __tabId__: res.sender.tabId },
        })
      )
    })
  }
  protected protocolSendMessager(type: any, data: any) {
    let toSendData = data,
      tabId = this.tabId
    if (data.__tabId__) {
      toSendData = data.data
      tabId = data.__tabId__
    }

    // console.log('send', type, data, tabId)
    sendMessage(
      this.props.sendType,
      { type, data: toSendData },
      {
        context: 'window',
        tabId,
      }
    )
  }

  onMessage(type: any, cb: (data: any) => any, noCallback?: boolean): void {
    const reCb = async (e: any) => {
      const { data, __tabId__ } = e.detail
      let res = await cb(data)

      if (noCallback) return
      this.protocolSendMessager(type, { data: res, __tabId__ } as any)
    }
    this.cbMap.set(cb, reCb)
    this.eventTarget.addEventListener(type as any, reCb)
  }
}
