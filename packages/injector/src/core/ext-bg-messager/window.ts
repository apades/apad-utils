import { onMessage, sendMessage, setNamespace } from 'webext-bridge/window'
import { Messager, ProtocolWithReturn } from '../Messager'

export default class WindowMessager<
  TProtocolMap = Record<string, ProtocolWithReturn<any, any>>
> extends Messager<TProtocolMap> {
  protected protocolListenMessager() {
    setNamespace('ext-bg-messager')
    onMessage(this.props.listenType, (res) => {
      const data = res.data as any
      this.eventTarget.dispatchEvent(
        new CustomEvent(data.type, { detail: data.data })
      )
    })
  }
  protected protocolSendMessager(type: any, data: any) {
    sendMessage(this.props.sendType, { type, data }, 'background')
  }
}
