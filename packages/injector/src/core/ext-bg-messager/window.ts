import {
  onMessage,
  sendMessage,
  setNamespace,
} from '../../../node_modules/webext-bridge/dist/window'
import { Messager, MessagerProps, ProtocolWithReturn } from '../Messager'

export default class WindowMessager<
  TProtocolMap = Record<string, ProtocolWithReturn<any, any>>
> extends Messager<TProtocolMap> {
  eventTarget = new EventTarget()
  props: MessagerProps
  cbMap = new Map<Function, Function>()

  protected protocolListenMessager() {
    setNamespace('ext-bg-messager')
    onMessage(this.props.listenType, (res) => {
      // console.log('messager', res)
      const data = res.data as any
      this.eventTarget.dispatchEvent(
        new CustomEvent(data.type, { detail: data.data })
      )
    })
  }
  protected protocolSendMessager(type: any, data: any) {
    // console.log('sendMessage', type, data)
    sendMessage(this.props.sendType, { type, data }, 'background')
  }
  // onMessage<TType extends string>(
  //   type: TType,
  //   cb: (data: any) => any,
  //   noCallback?: boolean
  // ): void {
  //   const reCb = async (e: any) => {
  //     let res = await cb(e.detail)

  //     if (noCallback) return
  //     sendMessage(this.props.sendType, { type, data: res }, 'background')
  //   }
  //   this.cbMap.set(cb, reCb)
  //   this.eventTarget.addEventListener(type as any, reCb)
  // }
  // offMessage<TType extends string>(type: TType, cb: (data: any) => any): void {
  //   const reCb = this.cbMap.get(cb)

  //   this.eventTarget.removeEventListener(type as any, reCb as any)
  //   this.cbMap.delete(cb)
  // }
  // onMessageOnce<TType extends string>(
  //   type: TType,
  //   noCallback?: boolean
  // ): Promise<any> {
  //   return new Promise((res, rej) => {
  //     const cb = (data: any) => {
  //       res(data)
  //       this.offMessage(type, cb as any)
  //     }
  //     this.onMessage(type, cb as any, noCallback)
  //   })
  // }
  // sendMessage<TType extends string>(type: TType, data?: any): Promise<any> {
  //   return sendMessage(type, data)
  // }
}
