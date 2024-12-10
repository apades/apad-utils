import type { Rec } from '@pkgs/tsconfig/types/global'
import type { FC } from 'preact/compat'
import type { ConfigField, I18n, InitOptions } from '../types'
import { classNames, debounce } from '@pkgs/utils/src/utils'
import { useCallback, useEffect, useMemo, useState } from 'preact/hooks'
import LoadingContainer from '../components/LoadingContainer'
import { useMemoizedFn, useOnce } from '../hooks'
import { ConfigEntriesBox } from './ConfigEntriesBox'
import './index.less'

export type ConfigEntries = Rec<ConfigField<any>>
export type BaseConfig = UISettings

export interface UISettings {
  [K: string]: ConfigField<any>
}
export type Props = {
  settings: UISettings
  configStore: Record<string, any>
  savedConfig?: UISettings
  tempConfigKeys?: string[]
  rootEl?: HTMLElement | ShadowRoot
  isLoading: boolean
  i18n: I18n
} & InitOptions<Record<string, any>>

const SettingPanel: FC<Props> = (props) => {
  const [newConfig, _setNewConfig] = useState<Partial<BaseConfig>>({})
  useEffect(() => {
    if (props.savedConfig)
      _setNewConfig(props.savedConfig)
  }, [props.savedConfig])
  // window.newConfig = newConfig
  // const toast = useToast()

  const setNewConfig = useMemoizedFn((key: string, val: any) => {
    if (props.changeConfigStoreWithSettingPanelChange)
      // runInAction(() => {
      props.configStore[key] = val
    // })

    _setNewConfig({ ...newConfig, [key]: val })

    saveConfig()
  })
  const resetConfig = useMemoizedFn((key: string) => {
    delete newConfig[key]
    _setNewConfig({ ...newConfig })
    if (props.changeConfigStoreWithSettingPanelChange) {
      props.configStore[key]
        = props.settings[key].defaultValue ?? props.settings[key]
    }
    saveConfig()
  })

  // 保存相关
  const _saveConfig = useMemoizedFn(async () => {
    if (!props.autoSave)
      return
    console.log('saveConfig', newConfig)
    if (props.saveInLocal) {
      switch (props.savePosition) {
        case 'localStorage': {
          localStorage[saveKey] = JSON.stringify(newConfig)
          break
        }
      }
    }
    if (props.onSave) {
      const newSaveData = await props.onSave({ ...newConfig })
      if (!newSaveData)
        return
      // 会不会出现对象地址问题
      const changes = Object.entries(newSaveData).filter(
        ([key, val]) => val !== newConfig[key],
      )
      if (!changes.length)
        return
      changes.forEach((key, val) => setNewConfig(key as any, val))
    }
    // toast({ title: '保存成功', status: 'success' })
  })
  const saveConfig = useCallback(
    debounce(_saveConfig, props.autoSaveTriggerMs),
    [],
  )

  const {
    baseConfig,
    advConfig,
    cateBaseConfig,
    cateAdvConfig,
    advConfigEntries,
    baseConfigEntries,
    cateAdvConfigEntries,
    cateBaseConfigEntries,
  } = useMemo(() => {
    const baseConfig: ConfigEntries = {}
    const advConfig: ConfigEntries = {}
    const cateBaseConfig: Record<string, ConfigEntries> = {}
    const cateAdvConfig: Record<string, ConfigEntries> = {}

    const configEntries = Object.entries(props.settings)

    configEntries.forEach(([key, _val]) => {
      const val = {
        ..._val,
        defaultValue: props.settings[key].defaultValue ?? props.settings[key],
      }
      const category = val.category
      if (category) {
        if (val.notRecommended) {
          cateAdvConfig[category] ??= {}
          cateAdvConfig[category][key] = val
        }
        else {
          cateBaseConfig[category] ??= {}
          cateBaseConfig[category][key] = val
        }
      }
      else {
        if (val.notRecommended) {
          advConfig[key] = val
          // advConfigEntries.push([key, val])
        }
        else {
          baseConfig[key] = val
          // baseConfigEntries.push([key, val])
        }
      }
    })
    return {
      baseConfig,
      advConfig,
      cateBaseConfig,
      cateAdvConfig,
      baseConfigEntries: Object.entries(baseConfig),
      advConfigEntries: Object.entries(advConfig),
      cateBaseConfigEntries: Object.entries(cateBaseConfig),
      cateAdvConfigEntries: Object.entries(cateAdvConfig),
    }
  }, [props.settings])

  const [nowCategory, setNowCategory] = useState(props.i18n.main)

  const showAdv = advConfigEntries.length || cateAdvConfigEntries.length

  if (cateBaseConfigEntries.length) {
    const isMain = nowCategory === props.i18n.main
    const nowConfig = isMain ? baseConfig : cateBaseConfig[nowCategory]
    const nowAdvConfig = isMain ? advConfig : cateAdvConfig[nowCategory]
    const showAdv = isMain ? !!advConfigEntries.length : !!nowAdvConfig

    const handleLeftClick = (key: string) => () => {
      setNowCategory(key)
    }
    return (
      <div className="setting-panel cate-type">
        <div className="category-panel">
          <div className="left">
            {[[props.i18n.main], ...cateBaseConfigEntries].map(([key]) => (
              <div
                key={key}
                className={classNames(nowCategory === key && 'active')}
                onClick={handleLeftClick(key)}
              >
                {key}
              </div>
            ))}
          </div>
          <div className="right">
            <ConfigEntriesBox
              i18n={props.i18n}
              tempConfigKeys={props.tempConfigKeys}
              config={nowConfig}
              newConfig={newConfig}
              setNewConfig={setNewConfig}
              resetConfig={resetConfig}
            />
            {showAdv && (
              <Summary title={props.i18n.noRecommended} open={false}>
                <ConfigEntriesBox
                  i18n={props.i18n}
                  tempConfigKeys={props.tempConfigKeys}
                  config={nowAdvConfig}
                  newConfig={newConfig}
                  setNewConfig={setNewConfig}
                  resetConfig={resetConfig}
                />
              </Summary>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="setting-panel one-type">
      <ConfigEntriesBox
        i18n={props.i18n}
        tempConfigKeys={props.tempConfigKeys}
        config={baseConfig}
        newConfig={newConfig}
        setNewConfig={setNewConfig}
        resetConfig={resetConfig}
      />
      {!!showAdv && (
        <Summary title={props.i18n.noRecommended} open={false}>
          <ConfigEntriesBox
            i18n={props.i18n}
            tempConfigKeys={props.tempConfigKeys}
            config={advConfig}
            newConfig={newConfig}
            setNewConfig={setNewConfig}
            resetConfig={resetConfig}
          />
        </Summary>
      )}
    </div>
  )
}
const Summary: FC<{
  children: (JSX.Element | JSX.Element[])[] | JSX.Element
  title: string
  open?: boolean
}> = (props) => {
  return (
    <details open={props.open ?? true}>
      <summary>{props.title}</summary>
      {props.children}
    </details>
  )
}

export const saveKey = '__settingPanel_config_save'
const UIComponent: FC<Props> = (props) => {
  const [isLoading, setLoading] = useState(props.isLoading)
  const [savedConfig, setSavedConfig] = useState<Partial<BaseConfig>>(
    props.savedConfig,
  )
  const [tempConfigKeys, setTempConfigKeys] = useState<string[]>([])
  useOnce(async () => {
    ;(globalThis as any).__spSetLoading = setLoading
    ;(globalThis as any).__spSetSavedConfig = setSavedConfig
    ;(globalThis as any).__spSetTempConfigKeys = setTempConfigKeys
    return () => {
      delete (globalThis as any).__spSetLoading
      delete (globalThis as any).__spSetSavedConfig
      delete (globalThis as any).__spSetTempConfigKeys
    }
  })

  return (
    <LoadingContainer isLoading={isLoading}>
      <SettingPanel
        {...props}
        savedConfig={savedConfig}
        tempConfigKeys={tempConfigKeys}
      />
    </LoadingContainer>
  )
}
export default UIComponent
