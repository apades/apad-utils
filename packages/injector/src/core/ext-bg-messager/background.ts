import { Messager, MessagerProps } from '../Messager'
import { MessageRelayProps } from '../messageRelay'
import { sendMessage, onMessage } from 'webext-bridge/background'

export default class WindowMessager extends Messager {
  eventTarget = new EventTarget()
  props: MessagerProps
  cbMap = new Map<Function, Function>()

  protected protocolListenMessager() {
    // 这里回应window怎么办
    onMessage(this.props.listenType, (res) => {
      const data = res.data as any
      this.eventTarget.dispatchEvent(
        new CustomEvent(data.type, { detail: data.data })
      )
    })
  }
  protected protocolSendMessager(type: any, data: any) {
    sendMessage(
      this.props.sendType,
      { type, data },
      {
        context: 'window',
        tabId: this.tabId,
      }
    )
  }
}
