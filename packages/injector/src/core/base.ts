import type { Messager } from './Messager'

export type InjectorBaseProps = {
  messager: Messager
  category?: string
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
  category: string
  protected messager: Messager
  protected messagerListeningMap = new Map<fn, string>()

  constructor(props: InjectorBaseProps) {
    Object.assign(this, props)
    // TODO 不该这里用
    this.init()
  }
  /**插件集合体载入实现类时调用 */
  abstract init(): void
  /**实现类卸载时调用 */
  protected abstract onUnmount(): void
  /**插件集合体卸载实现类时调用 */
  unmount() {
    this.onUnmount()
    ;[...this.messagerListeningMap.entries()].forEach(([fn, type]) => {
      this.messager.offMessage(type, fn)
    })
  }
  protected send(type: string, data?: any): Promise<any> {
    return this.messager.sendMessage(this.getTypeName(type), data)
  }
  protected on(type: string, callback: fn) {
    const name = this.getTypeName(type)
    this.messagerListeningMap.set(callback, name)
    return this.messager.onMessage(name, callback)
  }
  protected off(type: string, callback: fn) {
    const name = this.getTypeName(type)
    this.messagerListeningMap.delete(callback)
    return this.messager.offMessage(name, callback)
  }

  protected getTypeName(type: string) {
    return this.category + ':' + type
  }
}
