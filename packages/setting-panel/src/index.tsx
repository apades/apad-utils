import { createElement, isFunction, wait } from '@pkgs/utils/src/utils'
import { render } from 'entry'
import type mobx from 'mobx'
import UIComponent, { saveKey } from './UI'
import {
  IObjectDidChange,
  IValueDidChange,
  Lambda,
  makeAutoObservable,
  observe,
} from './mobx-mini'
import './tailwind.css'
import './index.less'

type ConfigFieldBase<T> = {
  defaultValue?: T
  desc?: string
  /**不填默认使用key作为label */
  label?: string
  notRecommended?: boolean
  /**分类 */
  category?: string
}
type ConfigGroupField<T> = {
  value: T
  desc?: string
  label?: string
}

export type ConfigField<T> =
  | ConfigFieldBase<T>
  | T
  | (ConfigFieldBase<T> & {
      type: 'group'
      // TODO 支持复杂数据传入
      // group: Record<T & string, ConfigGroupField<T> | T> | T[]
      group: T[]
    })
// | {
//     type: 'group-unlimited'
//     group: any[]
//   }

export function config<T>(config: ConfigField<T>) {
  return config
}

export type InitOptions<Map extends Record<string, any>> = {
  settings: {
    [K in keyof Map]: ConfigField<Map[K]>
  }
  /**初始化时载入设置，saveInLocal为false时返回的是空object */
  onInitLoadConfig?: (config?: Map) => Promise<Map> | Map
  /**保存时的数据，如果不关闭saveInLocal默认也会保存一份本地 */
  onSave?: (config: Map) => Promise<void> | void
  /**保存的位置，默认用localStorage
   *
   * TODO indexedDB
   *  */
  savePosition?: 'localStorage' /* | 'indexedDB' */
  /**保存到本地，默认为true */
  saveInLocal?: boolean
  /**是否使用shadow dom，避免css污染，默认关闭 */
  useShadowDom?: boolean
  /**默认为true，如果不想设置面板设置改动设置时修改configStore可以关闭 */
  changeConfigStoreWithSettingPanelChange?: boolean
  /**默认为true，输入停止{autoSaveTriggerMs}(默认500ms)后自动触发onSave */
  autoSave?: boolean
  /**默认500，自动保存用的 */
  autoSaveTriggerMs?: number
  /**默认的mobx是自己魔改的残缺版本，需要完整功能请传入mobx的module */
  mobx?: typeof mobx
  /**针对 非打包工具 + useShadowDom:true 的用户 */
  styleHref?: string
  /**默认为true */
  isModal?: boolean
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
  openSettingPanel: (
    /**渲染的位置，不传默认是开全局modal */
    renderTarget?: HTMLElement
  ) => void
  closeSettingPanel: () => void
  /**
   * mobx的监听
   *
   * listener的return返回函数的话可以像react useEffect那样在重新触发listener时运行该函数，可以用来清除上一次函数里相关的挂载操作然后重新挂载相关数据
   *  */
  observe: Observe<Map>
} {
  const baseOption: Partial<InitOptions<Map>> = {
    savePosition: 'localStorage',
    saveInLocal: true,
    useShadowDom: false,
    changeConfigStoreWithSettingPanelChange: true,
    autoSave: true,
    autoSaveTriggerMs: 500,
    isModal: true,
  }
  options = Object.assign(baseOption, options)

  const rootEl = createElement('div')
  const renderEl = createElement('div', {
    className: 'render-root',
  })
  if (options.useShadowDom) {
    rootEl.attachShadow({ mode: 'open' })
    rootEl.shadowRoot.appendChild(renderEl)
  } else {
    rootEl.appendChild(renderEl)
  }

  let isLoading = true
  let savedConfig = {}
  const configStore = createConfigStore(options.settings, options.mobx)

  const updateSavedConfig = () => {
    Object.entries(savedConfig).forEach(([key, val]) => {
      ;(configStore as any)[key] = val
    })
  }
  // 加载本地保存数据
  if (options.saveInLocal) {
    switch (options.savePosition) {
      case 'localStorage': {
        savedConfig = JSON.parse(localStorage[saveKey] || '{}')
        break
      }
    }
  }
  updateSavedConfig()
  // 加载options的异步/同步方法数据
  if (options.onInitLoadConfig) {
    ;(async () => {
      if (options.onInitLoadConfig)
        return options.onInitLoadConfig(savedConfig as any)
    })().then((_savedConfig) => {
      isLoading = false
      savedConfig = _savedConfig
      updateSavedConfig()
      ;(globalThis as any)?.__spSetLoading?.(false)
      ;(globalThis as any)?.__spSetSavedConfig?.(_savedConfig)
    })
  } else {
    isLoading = false
  }

  let hasInit = false
  function openSettingPanel(
    /**渲染的位置，不传默认是开全局modal */
    renderTarget?: HTMLElement
  ) {
    if (!hasInit) {
      if (options.styleHref || import.meta.url) {
        let style = createElement('link', {
          rel: 'stylesheet',
          type: 'text/css',
          href:
            options.styleHref || new URL('./index.css', import.meta.url).href,
        })

        options.useShadowDom
          ? rootEl.shadowRoot.appendChild(style)
          : document.head.appendChild(style)
      }
      const renderTo = renderTarget ?? renderEl

      render(
        <UIComponent
          settings={options.settings}
          configStore={configStore}
          rootEl={renderEl}
          isLoading={isLoading}
          savedConfig={savedConfig}
          {...options}
        />,
        renderTo
      )

      if (!renderTarget) {
        renderEl.classList.add('is-modal')
        const coverBg = createElement('div', {
          className: 'cover-bg',
          onclick: closeSettingPanel,
        })
        wait(100).then(() => {
          renderTo.appendChild(coverBg)
        })
      }
      hasInit = true
    }
    document.body.appendChild(rootEl)
  }
  function closeSettingPanel() {
    document.body.removeChild(rootEl)
  }

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
      return options.mobx
        ? options.mobx.observe(configStore, ...args)
        : observe(configStore, ...args)
    },
  }
}

export function createConfigStore<Map extends Record<string, any>>(
  settings: {
    [K in keyof Map]: ConfigField<Map[K]>
  },
  _mobx?: typeof mobx
): Map {
  const _makeAutoObservable: any = _mobx
    ? _mobx.makeAutoObservable
    : makeAutoObservable
  return _makeAutoObservable(
    Object.entries(settings).reduce(
      (configMap, [key, config]: [string, ConfigField<any>]) => {
        configMap[key] = config.defaultValue ?? config
        return configMap
      },
      {} as Record<any, any>
    )
  )
}
