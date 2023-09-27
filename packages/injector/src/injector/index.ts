import { InjectorEventType } from '../core/enmu'
import InjectorFetch from './fetch'

export type InitConfig = Partial<{
  /**dom的addEventListener事件 */
  domEvents: boolean
  /**fetch + XMLHttpRequest */
  fetch: boolean
  /**SPA路由监听 */
  history: boolean
}>

type InjectorConfig = {
  /**更新设置 */
  update: (config: InitConfig) => void
}

function initInjector(config: InitConfig): InjectorConfig {
  if (config.fetch) {
    let fetchInjector = new InjectorFetch({
      sendType: InjectorEventType.sendType,
      listenType: InjectorEventType.listenType,
    })
  }
}
