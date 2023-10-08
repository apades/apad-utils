import { isString } from '@pkgs/utils/src/utils'
import { noop } from '../../../../tsconfig/types/global'
import InjectorBase, { InjectorBaseProps } from '../../core/base'
import { FETCH } from './types'

export default class FetchClient extends InjectorBase {
  static _FetchClient: FetchClient
  constructor(props: InjectorBaseProps) {
    if (!FetchClient._FetchClient) {
      super({
        category: FETCH,
        ...props,
      })
      FetchClient._FetchClient = this
    }
    return FetchClient._FetchClient
  }
  init(): void {
    this.callbackMap = new Map()
  }
  protected onUnmount(): void {
    this.callbackMap = null
  }

  protected callbackMap: Map<string, noop>
  addListen(
    reg: RegExp | string,
    callback: (res: { url: string; args: any[]; res: string }) => void
  ) {
    this.callbackMap.set(reg + '', callback)
    const regex = isString(reg) ? new RegExp(reg) : reg

    this.send('addListen', regex)
    this.on('trigger', callback as noop)
  }

  removeListen(reg: RegExp | string) {
    const callback = this.callbackMap.get(reg + '')
    if (!callback) return console.log('没有需要移除的callback')

    this.send('removeListen', callback)
    this.off('trigger', callback as noop)
  }
}
