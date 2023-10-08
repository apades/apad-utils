import AsyncLock from '@pkgs/utils/src/AsyncLock'
import { noop } from '../../../../tsconfig/types/global'
import InjectorBase, { InjectorBaseProps } from '../../core/base'
import { EVAL } from './types'

export default class EvalClient extends InjectorBase {
  static _EvalClient: EvalClient
  constructor(props: InjectorBaseProps) {
    if (!EvalClient._EvalClient) {
      super({
        category: EVAL,
        ...props,
      })
      EvalClient._EvalClient = this
    }
    return EvalClient._EvalClient
  }
  init(): void {}
  protected onUnmount(): void {}

  async run<T extends noop>(fn: T, args?: any[]): Promise<ReturnType<T>> {
    const res = await this.send('run', { function: fn.toString(), args })

    return res
  }

  /**
   * 
   * @argument fn 传入的cb顺序需要跟args的顺序一样，然后里面return需要返回一个清除函数。
   * @returns {function} 会调用fn的return清除函数的函数
   * 
   * 例子
   * ```js
   * runWithCallback(
   * function (cb) {
      inTopWindowEventTarget.addEventListener('customEvent', cb)

      return () => {
        inTopWindowEventTarget.removeEventListener('customEvent', cb)
      }
    },
    [
      function cb(...args){
        console.log(...args)
      }
    ])
   * ```
   *
   */
  runWithCallback(
    fn: (...args: any[]) => () => void,
    args?: any[]
  ): () => void {
    const lock = new AsyncLock()
    const id = new Date().getTime()

    const newArgs = args.map((arg, i) => {
      if (typeof arg == 'function') return { type: 'function', arg: '' }
      return { type: 'normal', arg }
    })
    this.send('runWithCallback', {
      function: fn.toString(),
      args: newArgs,
      id,
    }).then(() => {
      lock.ok()
    })

    const handleOnCallbackRun = (res: any) => {
      const { index, data } = res
      if (res.id != id) return
      args[index](...data)
    }
    this.on('runWithCallback-callbackRun', handleOnCallbackRun)

    return async () => {
      await lock.waiting()
      this.off('runWithCallback-callbackRun', handleOnCallbackRun)
      this.send('runWithCallback-clear', { id })
    }
  }
}
