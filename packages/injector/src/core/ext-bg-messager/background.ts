import { onMessage, sendMessage } from 'webext-bridge/background'
import Browser from 'webextension-polyfill'
import { Messager, ProtocolWithReturn } from '../Messager'

const getActiveTabId = async () => {
  const [tab] = await Browser.tabs.query({ active: true })
  return tab.id
}
export default class WindowMessager<
  TProtocolMap = Record<string, ProtocolWithReturn<any, any>>
> extends Messager<TProtocolMap> {
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
  // FIXME 如果发送了不对的activeTabId（如chrome://页面），会导致卡住message回应，但传入正确的id会把之前的事件全部触发了
  protected async protocolSendMessager(type: any, data: any) {
    let toSendData = data,
      tabId = this.tabId || (await getActiveTabId())
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
