import { getDeepGetter } from '@pkgs/utils/src/utils'
import InjectorBase, { InjectorBaseProps } from '../../core/base'
import { VISIBILITY_STATE } from './types'

export default class VisibilityStateInjector extends InjectorBase {
  static _VisibilityStateInjector: VisibilityStateInjector
  constructor(props: InjectorBaseProps) {
    if (!VisibilityStateInjector._VisibilityStateInjector) {
      super({
        category: VISIBILITY_STATE,
        ...props,
      })
      VisibilityStateInjector._VisibilityStateInjector = this
    }
    return VisibilityStateInjector._VisibilityStateInjector
  }
  visibilityState: typeof document.visibilityState
  init(): void {
    this.injectSysAPI()
    this.on('alwaysVisible', () => this.alwaysVisible())
    this.on('alwaysHidden', () => this.alwaysHidden())
    this.on('restore', () => this.restore())
  }
  protected onUnmount(): void {
    this.restore()
  }

  alwaysVisible() {
    this.visibilityState = 'visible'
  }
  alwaysHidden() {
    this.visibilityState = 'hidden'
  }
  restore() {
    this.visibilityState = undefined
  }

  injectSysAPI() {
    // 这个getter是不能还原和多次设置的
    if (Object.getOwnPropertyDescriptor(document, 'visibilityState')?.get)
      return

    const originGetter = getDeepGetter(document, 'visibilityState').bind(
      document
    )
    if (!originGetter) throw Error('拿不到document.visibilityState的getter')
    try {
      Object.defineProperty(document, 'visibilityState', {
        get: () => {
          if (this.visibilityState) return this.visibilityState
          return originGetter()
        },
      })
    } catch (error) {
      console.error(error)
      throw Error('好像当前浏览器没法注入document.visibilityState的getter')
    }
  }
}
