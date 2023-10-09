export type MessagerProps = {
  sendType: string
  listenType: string
}
export class Messager<
  TProtocolMap = Record<string, ProtocolWithReturn<any, any>>
> {
  eventTarget = new EventTarget()
  props: MessagerProps

  cbMap = new Map<Function, Function>()

  constructor(props: MessagerProps) {
    this.props = props
    this.protocolListenMessager()
  }

  protected protocolListenMessager() {
    window.addEventListener(this.props.listenType, (e: any) => {
      const data = e.detail

      this.eventTarget.dispatchEvent(
        new CustomEvent(data.type, { detail: { protocolData: data.data } })
      )
    })
  }
  protected protocolSendMessager(type: any, data: any, protocolExtData: any) {
    const event = new CustomEvent(this.props.sendType, {
      detail: { protocolData: { type, data: data }, protocolExtData },
    })
    window.dispatchEvent(event)
  }

  onMessage<TType extends keyof TProtocolMap>(
    type: TType,
    cb: (
      data: GetDataType<TProtocolMap[TType]>
    ) => GetReturnType<TProtocolMap[TType]>,
    noCallback = false
  ) {
    const reCb = async (e: any) => {
      let res = await cb(e.detail.protocolData)

      if (noCallback) return
      this.protocolSendMessager(type, res as any, e.detail.protocolExtData)
    }
    this.cbMap.set(cb, reCb)
    this.eventTarget.addEventListener(type as any, reCb)
  }

  offMessage<TType extends keyof TProtocolMap>(
    type: TType,
    cb: (
      data: GetDataType<TProtocolMap[TType]>
    ) => GetReturnType<TProtocolMap[TType]>
  ) {
    const reCb = this.cbMap.get(cb)

    this.eventTarget.removeEventListener(type as any, reCb as any)
    this.cbMap.delete(cb)
  }

  onMessageOnce<TType extends keyof TProtocolMap>(
    type: TType,
    noCallback = false
  ): Promise<GetReturnType<TProtocolMap[TType]>> {
    return new Promise((res, rej) => {
      const cb = (data: any) => {
        res(data)
        this.offMessage(type, cb as any)
      }
      this.onMessage(type, cb as any, noCallback)

      // TODO ? 要不要搞限时message然后reject
    })
  }

  sendMessage<TType extends keyof TProtocolMap>(
    type: TType,
    data?: GetDataType<TProtocolMap[TType]>
  ): Promise<GetReturnType<TProtocolMap[TType]>> {
    this.protocolSendMessager(type, data, null)

    return this.onMessageOnce(type, true)
  }
}

export type ProtocolWithReturn<TData, TReturn> = {
  BtVgCTPYZu: TData
  RrhVseLgZW: TReturn
}
/**
 * Given a function declaration, `ProtocolWithReturn`, or a value, return the message's data type.
 */
type GetDataType<T> = T extends (...args: infer Args) => any
  ? Args['length'] extends 0 | 1
    ? Args[0]
    : never
  : T extends ProtocolWithReturn<any, any>
  ? T['BtVgCTPYZu']
  : T

/**
 * Given a function declaration, `ProtocolWithReturn`, or a value, return the message's return type.
 */
type GetReturnType<T> = T extends (...args: any[]) => infer R
  ? R
  : T extends ProtocolWithReturn<any, any>
  ? T['RrhVseLgZW']
  : void
