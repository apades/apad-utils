import InjectorBase, { InjectorBaseProps } from '../../core/base'
import { EVAL } from './types'

export default class EvalInjector extends InjectorBase {
  static _EvalInjector: EvalInjector
  constructor(props: InjectorBaseProps) {
    if (!EvalInjector._EvalInjector) {
      super({
        category: EVAL,
        ...props,
      })
      EvalInjector._EvalInjector = this
    }
    return EvalInjector._EvalInjector
  }
  init(): void {
    this.on('run', async (data) => {
      return await this.run(data)
    })

    this.on('runWithCallback', async (data) => {
      return await this.runWithCallback(data)
    })
  }
  protected onUnmount(): void {}

  async run(data: { function: string; args: any[] }) {
    const fn = new Function(`return (${data.function})(...arguments)`)

    return await fn(...(data.args ?? []))
  }

  async runWithCallback(data: { function: string; args: any[]; id: number }) {
    const fn = new Function(`return (${data.function})(...arguments)`)

    const args = (data.args ?? []).map((arg, index) => {
      if (arg.type == 'normal') return arg.arg
      if (arg.type == 'function')
        return (...args: any[]) => {
          this.send('runWithCallback-callbackRun', {
            index,
            data: args,
            id: data.id,
          })
        }
    })

    const clearCallback = await fn(...args)
    console.log('clearCallback')

    const handleClearRunWithCallback = ({ id }: any) => {
      if (id != data.id) return
      clearCallback()
      this.off('runWithCallback-clear', handleClearRunWithCallback)
    }
    this.on('runWithCallback-clear', handleClearRunWithCallback)
  }
}
