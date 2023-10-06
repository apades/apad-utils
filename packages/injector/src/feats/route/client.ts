import { noop } from '../../../../tsconfig/types/global'
import InjectorBase, { InjectorBaseProps } from '../../core/base'
import { ROUTE } from './types'

export default class RouteClient extends InjectorBase {
  static _RouteClient: RouteClient
  constructor(props: InjectorBaseProps) {
    if (!RouteClient._RouteClient) {
      super({
        category: ROUTE,
        ...props,
      })
      RouteClient._RouteClient = this
    }
    return RouteClient._RouteClient
  }
  init(): void {}
  protected onUnmount(): void {}

  /**所有的集合体，路由改变就触发 */
  onChange(callback: noop) {
    this.on('change', callback)
    return () => {
      this.off('change', callback)
    }
  }
  onForward(callback: noop) {
    this.on('forward', callback)
    return () => {
      this.off('forward', callback)
    }
  }
  onPushState(callback: noop) {
    this.on('pushState', callback)
    return () => {
      this.off('pushState', callback)
    }
  }
  onReplaceState(callback: noop) {
    this.on('replaceState', callback)
    return () => {
      this.off('replaceState', callback)
    }
  }
  onPopstate(callback: noop) {
    this.on('popstate', callback)
    return () => {
      this.off('popstate', callback)
    }
  }
}
