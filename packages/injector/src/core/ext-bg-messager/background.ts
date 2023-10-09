import { Messager, MessagerProps } from '../Messager'
import { MessageRelayProps } from '../messageRelay'
import { sendMessage, setNamespace, onMessage } from 'webext-bridge/window'

export default class WindowMessager extends Messager {
  eventTarget = new EventTarget()
  props: MessagerProps
  cbMap = new Map<Function, Function>()

  protected protocolListenMessager() {
    setNamespace('ext-bg-messager')
    onMessage(this.props.listenType, (res) => {
      const data = res.data as any
      this.eventTarget.dispatchEvent(
        new CustomEvent(data.type, { detail: data.data })
      )
    })
  }
  protected protocolSendMessager(type: any, data: any, protocolExtData: any) {
    sendMessage(
      this.props.sendType,
      { type, data },
      {
        context: 'window',
        tabId: protocolExtData.tabId,
      }
    )
  }
}
