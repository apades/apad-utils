import ReactDOM from 'react-dom/client'
import UIComponent from './UI'
import {
  IObjectDidChange,
  IValueDidChange,
  Lambda,
  makeAutoObservable,
  observe,
} from 'mobx'
import { isFunction, isString } from 'lodash'

type ConfigFieldBase<T> = {
  defaultValue?: T
  desc?: string
  /**不填默认使用key作为label */
  label?: string
  notRecommended?: boolean
  /**分类 */
  category?: string
}
export type ConfigField<T> = ConfigFieldBase<T> &
  (
    | ConfigFieldBase<T>
    | {
        type: 'colorPicker' | 'date'
      }
    | {
        type: 'group'
        group: T[]
      }
    | {
        type: 'group-unlimited'
        group: any[]
      }
  )

export function config<T>(config: ConfigField<T>) {
  return config
}

export type InitOptions<Map extends Record<string, any>> = {
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
  /**渲染的位置，不传默认是开全局modal */
  renderTarget?: HTMLElement
  /**是否使用shadow dom，避免css污染，默认开启 */
  useShadowDom?: boolean
}

type Observe<Map extends Record<string, any>> = {
  <Key extends keyof Map>(
    property: Key,
    listener: (change: IValueDidChange<Map[Key]>) => (() => void) | void,
    fireImmediately?: boolean
  ): Lambda
  (
    listener: (change: IObjectDidChange) => (() => void) | void,
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
  closeSettingPanel: () => void
  /**
   * mobx的监听
   *
   * listener的return返回函数的话可以像react useEffect那样在重新触发listener时运行该函数，可以用来清除上一次函数里相关的挂载操作然后重新挂载相关数据
   *  */
  observe: Observe<Map>
} {
  const rootEl = document.createElement('div')
  rootEl.attachShadow({ mode: 'open' })
  if (!window.domRoot) {
    window.domRoot = ReactDOM.createRoot(rootEl.shadowRoot)
    document.body.appendChild(rootEl)
  }

  function openSettingPanel() {
    window.domRoot.render(
      <UIComponent
        settings={options.settings}
        configStore={configStore}
        rootEl={rootEl.shadowRoot}
      />
    )
  }
  function closeSettingPanel() {
    // console.log('close 2')
    // domRoot.unmount()
  }
  const configStore = createConfigStore(options.settings)

  return {
    openSettingPanel,
    closeSettingPanel,
    configStore,
    observe(...args: [any]) {
      let reLoadCb = () => 1
      args.forEach((arg, i) => {
        if (isFunction(arg)) {
          args[i] = (...listenFnArgs: [any]) => {
            reLoadCb()
            reLoadCb = arg(...listenFnArgs)
          }
        }
      })
      return observe(configStore, ...args)
    },
  }
}

export function createConfigStore<Map extends Record<string, any>>(
  settings: {
    [K in keyof Map]: ConfigField<Map[K]>
  }
) {
  return makeAutoObservable(
    Object.entries(settings).reduce(
      (configMap, [key, config]: [string, ConfigField<any>]) => {
        configMap[key] = config.defaultValue
        return configMap
      },
      {} as Record<any, any>
    )
  )
}