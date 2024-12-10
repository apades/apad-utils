import type mobx from 'mobx'
import type { ConfigField, InitOptions, InitSettingReturn } from './types'
import { AsyncLock } from '@pkgs/utils/main'
import { createElement, wait } from '@pkgs/utils/src/utils'
import { render } from 'entry'
import en from './i18n/en.json'
import { makeAutoObservable, observe } from './mobx-mini'
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

  let isLoading = true
  let savedConfig = {}
  const asyncInitLock = new AsyncLock()
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
      return options.onInitLoadConfig(savedConfig as any)
    })().then((_savedConfig) => {
      asyncInitLock.ok()
      isLoading = false
      savedConfig = _savedConfig
      updateSavedConfig()
      ;(globalThis as any)?.__spSetLoading?.(false)
      ;(globalThis as any)?.__spSetSavedConfig?.(savedConfig)
    })
  }
  else {
    asyncInitLock.ok()
    isLoading = false
  }

  let hasInit = false
  let rootEl: HTMLElement = null
  function openSettingPanel(
    /** 渲染的位置，不传默认是开全局modal */
    renderTarget?: HTMLElement,
  ) {
    if (!hasInit) {
      rootEl = createElement('div')
      const renderEl = createElement('div', {
        className: 'render-root',
      })
      if (options.useShadowDom) {
        rootEl.attachShadow({ mode: 'open' })
        rootEl.shadowRoot.appendChild(renderEl)
      }
      else {
        rootEl.appendChild(renderEl)
      }

      if (options.styleHref || import.meta.url) {
        const style = createElement('link', {
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
          i18n={options.i18n ?? en}
          settings={options.settings}
          configStore={configStore}
          rootEl={renderEl}
          isLoading={isLoading}
          savedConfig={savedConfig}
          {...options}
        />,
        renderTo,
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

  function _observe(...args: [any]): any {
    return options.mobx
      ? options.mobx.observe(configStore, ...args)
      : observe(configStore, ...args)
  }

  let tempConfigKeys: string[] = []
  return {
    openSettingPanel,
    closeSettingPanel,
    configStore,
    observe: _observe,
    temporarySetConfigStore: async (key, val) => {
      await asyncInitLock.waiting()
      if (options.mobx) {
        options.mobx.runInAction(() => {
          configStore[key] = val
        })
      }
      else {
        configStore[key] = val
      }

      savedConfig = { ...savedConfig, [key]: val }
      tempConfigKeys = [...tempConfigKeys, key as string]
      ;(globalThis as any)?.__spSetSavedConfig?.(savedConfig)
      ;(globalThis as any)?.__spSetTempConfigKeys?.(tempConfigKeys)
    },
  }
}

export function createConfigStore<Map extends Record<string, any>>(
  settings: {
    [K in keyof Map]: ConfigField<Map[K]>
  },
  _mobx?: typeof mobx,
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
      {} as Record<any, any>,
    ),
  )
}
