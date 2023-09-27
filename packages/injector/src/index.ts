import { noop } from '../../tsconfig/types/global'
import { InitConfig } from './injector'

const injector = {
  domEvents: {},
  fetch: {},
  history: {},
  /**触发事件 */
  triggerEvents: {
    /**触发一次 */
    once: () => {},
    /**循环触发 */
    interval: () => {},
  },
  eval: {
    async run<FN extends noop>(fn: FN, args?: any[]): Promise<ReturnType<FN>> {
      return 'dasf' as ReturnType<FN>
    },
  },
  /**自定义注入 */
  inject: {},
  /** */
  config: {
    update: async (config: InitConfig): Promise<void> => {},
  },
}

export default injector
