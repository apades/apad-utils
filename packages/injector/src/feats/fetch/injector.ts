import InjectorBase, { InjectorBaseProps } from '../../core/base'
import { FETCH } from './types'

export default class FetchInjector extends InjectorBase {
  static _FetchInjector: FetchInjector
  constructor(props: InjectorBaseProps) {
    if (!FetchInjector._FetchInjector) {
      super({
        category: FETCH,
        ...props,
      })
      FetchInjector._FetchInjector = this
    }
    return FetchInjector._FetchInjector
  }

  triggerMap: Map<RegExp, (url: string, args: any[], res: any) => void>
  ofetch: typeof fetch
  oXMLHttpRequest: typeof XMLHttpRequest
  init(): void {
    this.injectSysAPI()
    this.initMsgEvents()
  }
  protected onUnmount(): void {
    window.fetch = this.ofetch
    window.XMLHttpRequest = this.oXMLHttpRequest

    this.triggerMap = null
  }

  injectSysAPI() {
    this.triggerMap = new Map()
    this.ofetch = fetch
    this.oXMLHttpRequest = XMLHttpRequest

    const ofetch = this.ofetch

    const triggerMap = this.triggerMap
    async function _fetch(...args: any[]) {
      let keys = [...triggerMap.keys()]

      let hasTrigger = keys.find((k) => k.test(args[0]))
      if (!hasTrigger) return ofetch(...(args as [any]))

      // console.log('fetch hacker:onTrigger', hasTrigger)
      let res = await ofetch(...(args as [any]))
      let fn = triggerMap.get(hasTrigger)
      try {
        fn(args[0], args, await res.text())
      } catch (error) {
        console.warn(
          `fetch hacker没法触发回调，该地址返回数据的非text`,
          args[0]
        )
      }

      return res
    }

    globalThis.fetch = _fetch

    const oXMLHttpRequest = this.oXMLHttpRequest

    globalThis.XMLHttpRequest = class extends oXMLHttpRequest {
      url: string
      method: string
      open(method: string, url: string | URL): void
      open(
        method: string,
        url: string | URL,
        async: boolean,
        username?: string,
        password?: string
      ): void
      open(...args: any[]): void {
        this.url = args[1]
        this.method = args[0]
        return super.open(...(args as [any, any]))
      }
      send(body?: Document | XMLHttpRequestBodyInit): void {
        this.addEventListener('load', (res) => {
          const keys = [...triggerMap.keys()]

          const hasTrigger = keys.find((k) => k.test(this.url))
          if (!hasTrigger) return
          let fn = triggerMap.get(hasTrigger)
          fn(this.url, [this.method, body], this.responseText)
        })
        return super.send(body)
      }
    }
  }
  initMsgEvents() {
    this.on('addListen', (reg) => {
      this.triggerMap.set(reg, (url, args, res) => {
        this.send('trigger', { url, args, res })
      })
    })
    this.on('removeListen', (reg) => {
      this.triggerMap.delete(reg)
    })
  }
}
