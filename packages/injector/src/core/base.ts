import { Rec } from '../../../tsconfig/types/global'
export type InjectorBaseProps = {
  sendType: string
  listenType: string
}

type fn = (data: any) => any | Promise<any>
/**
 * class a send -> class b会相互回应send的type
 *
 * 内部初始化只能有一个监听事件函数，外部可以多次监听
 *
 * 外部调用send
 */
export default abstract class InjectorBase {
  sendType: string
  listenType: string
  abstract category: string
  eventCallback: Rec<fn> = {}

  private async handleListen(e: any) {
    const { category, type, data } = e.detail

    if (category != this.category) return
    const res = await this.eventCallback[type](data)
    this.send(type, res)
  }

  constructor(props: InjectorBaseProps) {
    this.sendType = props.sendType
    this.listenType = props.listenType

    this.initListen()
  }
  abstract init(): void
  protected abstract onUnmount(): void
  unmount() {
    window.removeEventListener(this.listenType, this.handleListen)
  }
  initListen() {
    window.addEventListener(this.listenType, this.handleListen)
  }
  send(type: string, data: any): Promise<any> {
    window.dispatchEvent(
      new CustomEvent(this.sendType, {
        detail: { category: this.category, type, data },
      })
    )

    return new Promise((res) => {
      function handleSendResp(e: any) {
        const { category, type: dType, data } = e.detail

        if (category != this.category) return
        if (dType == type) {
          window.removeEventListener(this.sendType, handleSendResp)
          res(data)
        }
      }
      window.addEventListener(this.sendType, handleSendResp)
    })
  }
  on(type: string, callback: fn) {
    this.eventCallback[type] = callback
  }
  off(type: string) {
    delete this.eventCallback[type]
  }
}
