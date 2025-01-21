import type { BaseMobx, ConfigField, InitOptions, InitSettingReturn } from './types'
import { createElement, debounce } from '@pkgs/utils/src/utils'
import { render } from 'entry'
import en from './i18n/en.json'
import UIComponent, { saveKey } from './UI'
import './index.less'
import './tailwind.css'

export function config<T>(config: ConfigField<T>) {
  return config
}

export function getPureKeyValueMap(config: any) {
  return Object.fromEntries(
    Object.entries(config).map(([key, val]: [string, any]) => {
      return [key, val?.defaultValue ?? val]
    }),
  )
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

  const { mobx } = options
  const configStore = createConfigStore(options.settings, mobx)
  const config = createConfigStore({ isLoading: true }, mobx)
  const savedConfig = createConfigStore({}, mobx)

  const updateConfig = (propsSavedConfig?: any) => {
    const updateSavedConfig = (_savedConfig: any) => {
      Object.entries(_savedConfig).forEach(([key, val]) => {
        ;(configStore as any)[key] = val
        ;(savedConfig as any)[key] = val
      })
      window.__spUpdate?.()
    }
    if (propsSavedConfig) {
      return updateSavedConfig(propsSavedConfig)
    }
    // 加载本地保存数据
    if (options.saveInLocal) {
      switch (options.savePosition) {
        case 'localStorage': {
          updateSavedConfig(JSON.parse(localStorage[saveKey] || '{}'))
          break
        }
      }
    }

    // 加载options的异步/同步方法数据
    if (options.onInitLoadConfig) {
      ;(async () => {
        return options.onInitLoadConfig(savedConfig as any)
      })().then((savedConfig) => {
        config.isLoading = false
        updateSavedConfig(savedConfig)
      })
    }
    else {
      config.isLoading = false
    }
  }

  const saveConfig = debounce(async () => {
    if (options.saveInLocal) {
      switch (options.savePosition) {
        case 'localStorage': {
          localStorage[saveKey] = JSON.stringify(savedConfig)
          break
        }
      }
    }
    if (options.onSave) {
      const newSaveData = await options.onSave({ ...savedConfig as any })
      if (!newSaveData)
        return
      Object.entries(newSaveData).forEach(
        ([key, val]) => {
          savedConfig[key] = val
        },
      )
    }
  }, options.autoSaveTriggerMs)

  updateConfig()

  let unmount = () => {}
  const root = createElement('div')

  function openSettingPanel(
    /** 渲染的位置，不传默认是开全局modal */
    renderTarget: HTMLElement = document.body,
  ) {
    renderTarget.appendChild(root)
    updateConfig()
    unmount = render(
      <UIComponent
        i18n={options.i18n ?? en}
        settings={options.settings}
        configStore={configStore}
        config={config}
        savedConfig={savedConfig}
        onClose={closeSettingPanel}
        styleHref={options.styleHref || new URL('./index.css', import.meta.url).href}
        saveConfig={saveConfig}
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
    updateConfig: updateConfig as any,
    saveConfig,
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
