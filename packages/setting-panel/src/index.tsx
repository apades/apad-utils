import ReactDOM from 'react-dom/client'
import UIComponent from './UI'
import {
  IObjectDidChange,
  IValueDidChange,
  Lambda,
  makeAutoObservable,
  observe,
} from 'mobx'
import { isString } from 'lodash'

export type ConfigField<T> = {
  defaultValue?: T
  desc?: string
  /**不填默认使用key作为label */
  label?: string
  notRecommended?: boolean
  group?: string
}

export function config<T>(config: ConfigField<T>) {
  return config
}

type InitOptions<Map extends Record<string, any>> = {
  settings: {
    [K in keyof Map]: ConfigField<Map[K]>
  }
  /**初始化时载入设置 */
  onInitLoadConfig?: () => Promise<Map> | Map
  /**保存时的数据 */
  onSave?: (config: Map) => Promise<void> | void
  /**保存的位置，默认用localStorage */
  savePosition?: 'localStorage' | 'indexedDB'
  /**保存到本地，默认为true */
  saveInLocal?: boolean
}

type Observe<Map extends Record<string, any>> = {
  <Key extends keyof Map>(
    property: Key,
    listener: (change: IValueDidChange<Map[Key]>) => void,
    fireImmediately?: boolean
  ): Lambda
  (
    listener: (change: IObjectDidChange) => void,
    fireImmediately?: boolean
  ): Lambda
}
export function initSetting<Map extends Record<string, any>>(
  options: InitOptions<Map>
): {
  /**从options.settings转化成的mobx结构数据 */
  configStore: Map
  /**打开设置面板的UI */
  openSettingPanel: () => void
  /**mobx的监听 */
  observe: Observe<Map>
} {
  const rootEl = document.createElement('div')
  rootEl.attachShadow({ mode: 'open' })
  function openSettingPanel() {
    ReactDOM.createRoot(rootEl.shadowRoot).render(<UIComponent />)
  }
  const configStore: any = makeAutoObservable(
    Object.entries(options.settings).reduce(
      (configMap, [key, config]: [string, ConfigField<any>]) => {
        configMap[key] = config.defaultValue
        return configMap
      },
      {} as Record<any, any>
    )
  )

  return {
    openSettingPanel,
    configStore,
    observe(...args: [any]) {
      return observe(configStore, ...args)
    },
  }
}
