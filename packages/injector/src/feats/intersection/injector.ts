import { getClientRect, isString } from '@pkgs/utils/src/utils'
import InjectorBase, { InjectorBaseProps } from '../../core/base'
import { INTERSECTION, InjectorIntersectionObserver } from './types'
import { dq1 } from '@pkgs/utils/src/dom'

export default class IntersectionInjector extends InjectorBase {
  static _IntersectionInjector: IntersectionInjector
  constructor(props: InjectorBaseProps) {
    if (!IntersectionInjector._IntersectionInjector) {
      super({
        category: INTERSECTION,
        ...props,
      })
      IntersectionInjector._IntersectionInjector = this
    }
    return IntersectionInjector._IntersectionInjector
  }
  init(): void {
    this.injectSysAPI()
    this.initMsgEvents()
  }
  protected onUnmount(): void {
    window.IntersectionObserver = this.oIntersectionObserver
  }

  oIntersectionObserver: typeof IntersectionObserver
  observerMap: Map<Element, InjectorIntersectionObserver>
  protected injectSysAPI() {
    const _IntersectionObserver = IntersectionObserver
    this.oIntersectionObserver = _IntersectionObserver

    const elMap = this.observerMap

    globalThis.IntersectionObserver = class
      extends _IntersectionObserver
      implements InjectorIntersectionObserver
    {
      callback: IntersectionObserverCallback
      options: IntersectionObserverInit

      constructor(
        callback: IntersectionObserverCallback,
        options?: IntersectionObserverInit
      ) {
        super(callback, options)
        this.callback = callback
        this.options = options
      }

      observe(target: Element) {
        elMap.set(target, this)
        return super.observe(target)
      }
    }
  }
  protected initMsgEvents() {
    this.on('interActive', (data) => {
      this.interActive(data.el)
    })
  }

  interActive(el: Element | string) {
    if (isString(el)) el = dq1(el)
    const observer = this.observerMap.get(el)
    if (observer) return console.error('该el没有在监听', el)
    const rect = getClientRect(el as HTMLElement)
    observer.callback(
      [
        {
          intersectionRatio: 1,
          isIntersecting: true,
          target: el,
          time: 1000,
          boundingClientRect: rect,
          intersectionRect: rect,
          rootBounds: rect,
        },
      ],
      observer
    )
  }
}
