import AsyncLock from '@pkgs/utils/src/AsyncLock'
import { createElement, debounce, wait } from '@pkgs/utils/src/utils'
import { render } from 'entry'
import type mobx from 'mobx'
import UIComponent, { saveKey } from './UI'
import en from './i18n/en.json'
import './index.less'
import { makeAutoObservable, observe as mObserve } from './mobx-mini'
import { observer as mObserver } from './react'
import './tailwind.css'
import { ConfigField, InitOptions, InitSettingReturn } from './types'
import { MOBX_LOADING } from './keys'

export function config<T>(config: ConfigField<T>) {
  return config
}

export function initSetting<Map extends Record<string, any>>(
  options: InitOptions<Map>
): InitSettingReturn<Map> {
  const baseOption: Partial<InitOptions<Map>> = {
    saveInLocal: true,
    useShadowDom: false,
    autoSave: true,
    autoSaveTriggerMs: 500,
    isModal: true,
  }
  options = Object.assign(baseOption, options)

  const observe = (...args: [any]) =>
    options.mobx
      ? options.mobx.observe(configStore, ...args)
      : mObserve(configStore, ...args)
  const observer = (options.mobxObserver ?? mObserver) as any

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

  const configStore = createConfigStore(
    { ...options.settings, [MOBX_LOADING]: false },
    options.mobx
  )

  const updateConfig = async () => {
    let savedConfig: Record<string, any> = {}
    // 加载本地保存数据
    if (options.saveInLocal) {
      savedConfig = JSON.parse(localStorage[saveKey] || '{}')
    }
    if (options.onInitLoadConfig) {
      configStore[MOBX_LOADING] = true
      savedConfig = await options.onInitLoadConfig(savedConfig as any)
    }
    for (const key in savedConfig) {
      ;(configStore as any)[key] = savedConfig[key]
    }
    configStore[MOBX_LOADING] = false
  }

  const saveConfig = async () => {
    let tarConfig: Record<string, any> = configStore
    if (options.onSave) {
      tarConfig = (await options.onSave(tarConfig as any)) as any
    }
    if (options.saveInLocal) {
      localStorage[saveKey] = JSON.stringify(tarConfig)
    }
  }

  if (options.autoSave) {
    const save = debounce(saveConfig, options.autoSaveTriggerMs)
    observe(save)
  }

  updateConfig()

  let hasInit = false
  function openSettingPanel(
    /**渲染的位置，不传默认是开全局modal */
    renderTarget?: HTMLElement
  ) {
    if (!hasInit) {
      const App = observer(UIComponent)
      render(
        <App
          i18n={options.i18n ?? en}
          settings={options.settings}
          configStore={configStore}
          observer={observer}
          {...options}
        />,
        renderEl
      )
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
      if (options.isModal) {
        renderEl.classList.add('is-modal')
        const coverBg = createElement('div', {
          className: 'cover-bg',
          onclick: closeSettingPanel,
        })
        wait(100).then(() => {
          renderEl.appendChild(coverBg)
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
    configStore: configStore as any as Map,
    observe,
    saveConfig,
    updateConfig,
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
