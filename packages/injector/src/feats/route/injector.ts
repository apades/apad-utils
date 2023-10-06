import { KeyOfType } from '../../../../tsconfig/types/global'
import InjectorBase, { InjectorBaseProps } from '../../core/base'
import { injectFunction } from '../../core/inject/function'
import { ROUTE } from './types'

export default class RouteInjector extends InjectorBase {
  static _RouteInjector: RouteInjector
  constructor(props: InjectorBaseProps) {
    if (!RouteInjector._RouteInjector) {
      super({
        category: ROUTE,
        ...props,
      })
      RouteInjector._RouteInjector = this
    }
    return RouteInjector._RouteInjector
  }
  init(): void {
    this.injectSysAPI()
  }
  protected onUnmount(): void {
    this.restore?.()
  }

  private restore: () => void
  injectSysAPI() {
    const onRouteChange = (keys: KeyOfType<typeof history, Function>[]) => {
      const restores = keys.map(
        (key) =>
          injectFunction(history, key, () => {
            this.send(key)
            this.send('change')
          }).restore
      )
      return () => restores.forEach((re) => re())
    }

    const handlePopstate = () => {
      this.send('popstate')
      this.send('change')
    }
    window.addEventListener('popstate', handlePopstate)

    this.restore = () => {
      onRouteChange([
        // 'back',
        'forward',
        'pushState',
        'replaceState',
        // 'go',
      ])
      window.removeEventListener('popstate', handlePopstate)
    }
  }
}
