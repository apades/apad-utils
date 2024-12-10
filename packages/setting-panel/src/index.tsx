import type { BaseMobx, ConfigField, InitOptions, InitSettingReturn } from './types'
import { createElement } from '@pkgs/utils/src/utils'
import { render } from 'entry'
import en from './i18n/en.json'
import UIComponent, { saveKey } from './UI'
import './index.less'
import './tailwind.css'

export function config<T>(config: ConfigField<T>) {
  return config
}

export function initSetting<Map extends Record<string, any>>(
  options: InitOptions<Map>,
): InitSettingReturn<Map> {
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

  let savedConfig = {}
  const { mobx } = options
  const configStore = createConfigStore(options.settings, mobx)
  const config = createConfigStore({ isLoading: true }, mobx)

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
      return options.onInitLoadConfig(savedConfig as any)
    })().then((_savedConfig) => {
      config.isLoading = false
      savedConfig = _savedConfig
      updateSavedConfig()
    })
  }
  else {
    config.isLoading = false
  }

  let unmount = () => {}
  const root = createElement('div')

  function openSettingPanel(
    /** 渲染的位置，不传默认是开全局modal */
    renderTarget: HTMLElement = document.body,
  ) {
    renderTarget.appendChild(root)
    unmount = render(
      <UIComponent
        i18n={options.i18n ?? en}
        settings={options.settings}
        configStore={configStore}
        config={config}
        savedConfig={savedConfig}
        onClose={closeSettingPanel}
        styleHref={options.styleHref || new URL('./index.css', import.meta.url).href}
        {...options}
      />,
      root,
    )
  }
  function closeSettingPanel() {
    unmount()
  }

  function _observe(...args: [any]): any {
    return mobx.observe(configStore, ...args)
  }

  return {
    openSettingPanel,
    closeSettingPanel,
    configStore,
    observe: _observe,
  }
}

export function createConfigStore<Map extends Record<string, any>>(
  settings: {
    [K in keyof Map]: ConfigField<Map[K]>
  },
  mobx: BaseMobx,
): Map {
  return mobx.makeAutoObservable(
    Object.entries(settings).reduce(
      (configMap, [key, config]: [string, ConfigField<any>]) => {
        configMap[key] = config.defaultValue ?? config
        return configMap
      },
      {} as Record<any, any>,
    ),
  )
}
