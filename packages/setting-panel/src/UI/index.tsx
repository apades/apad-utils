import {
  debounce,
  isBoolean,
  isEqual,
  isUndefined,
} from '@pkgs/utils/src/utils'
import type { FC } from 'preact/compat'
import { useCallback, useEffect, useState } from 'preact/hooks'
import { ConfigField, InitOptions } from '..'
import LoadingContainer from '../components/LoadingContainer'
import { useMemoizedFn, useOnce } from '../hooks'

type ConfigEntries = [string, ConfigField<any>][]
type BaseConfig = UISettings

export type UISettings = {
  [K: string]: ConfigField<any>
}
export type Props = {
  settings: UISettings
  configStore: Record<string, any>
  savedConfig?: UISettings
  rootEl?: HTMLElement | ShadowRoot
  isLoading: boolean
} & InitOptions<Record<string, any>>

const SettingPanel: FC<Props> = (props) => {
  let [newConfig, _setNewConfig] = useState<Partial<BaseConfig>>({})
  useEffect(() => {
    if (props.savedConfig) _setNewConfig(props.savedConfig)
  }, [props.savedConfig])
  window.newConfig = newConfig
  let configEntries = Object.entries(props.settings)
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
    if (props.changeConfigStoreWithSettingPanelChange)
      props.configStore[key] = props.settings[key].defaultValue
    saveConfig()
  })

  // 保存相关
  const _saveConfig = useMemoizedFn(async () => {
    if (!props.autoSave) return
    console.log('saveConfig')
    if (props.saveInLocal) {
      switch (props.savePosition) {
        case 'localStorage': {
          localStorage[saveKey] = JSON.stringify(newConfig)
          break
        }
      }
    }
    if (props.onSave) await props.onSave(newConfig)
    // toast({ title: '保存成功', status: 'success' })
  })
  const saveConfig = useCallback(
    debounce(_saveConfig, props.autoSaveTriggerMs),
    []
  )

  const baseConfigEntries: ConfigEntries = [],
    advConfigEntries: ConfigEntries = []

  configEntries.forEach(([key, _val]) => {
    const val = { ..._val, defaultValue: props.settings[key].defaultValue }
    if (val.notRecommended) advConfigEntries.push([key, val])
    else baseConfigEntries.push([key, val])
  })

  return (
    <ConfigEntriesBox
      config={baseConfigEntries}
      newConfig={newConfig}
      setNewConfig={setNewConfig}
      resetConfig={resetConfig}
    />
  )
}

const ConfigEntriesBox: FC<{
  config: ConfigEntries
  newConfig: Partial<UISettings>
  setNewConfig: (key: string, val: any) => void
  resetConfig: (key: string) => void
}> = (props) => {
  return (
    <div>
      {props.config.map(([key, val]: [string, ConfigField<any>], i) => {
        const hasChange =
          !isUndefined(props.newConfig[key]) &&
          !isEqual(props.newConfig[key], val.defaultValue)
        console.log(
          `key ${key} hasChange`,
          hasChange,
          props.newConfig[key],
          val.defaultValue
        )
        return (
          <div
            className={`group py-[6px] px-[6px] ${
              i % 2 == 0 ? 'bg-gray-200' : 'bg-white'
            }`}
            key={i}
          >
            <div className="gap-[12px] flex">
              <div
                className={`items-center justify-center text-center w-[140px] whitespace-pre-wrap ${
                  hasChange && 'text-blue-500'
                }`}
              >
                {val.label ?? key}:
              </div>
              <div className="flex-1">
                <div className="flex gap-[12px]">
                  <div className="flex-1 items-center justify-center">
                    <ConfigRowAction
                      config={val}
                      onChange={(v) => {
                        props.setNewConfig(key, v)
                      }}
                      newVal={(props.newConfig as any)[key]}
                    />
                  </div>
                  <div
                    className={`items-center justify-center opacity-0 ${
                      hasChange && 'group-hover:opacity-100'
                    } transition-all`}
                  >
                    <button
                      className="bg-red-700 h-[24px]"
                      disabled={!(props.newConfig as any)[key]}
                      onClick={() => {
                        props.resetConfig(key)
                      }}
                    >
                      重置
                    </button>
                  </div>
                </div>
                {val.desc && (
                  <div className="mt-[2px] flex-1 text-[12px] text-blue-500">
                    {val.desc}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

const ConfigRowAction = (props: {
  config: ConfigField<any>
  onChange: (v: any) => void
  newVal: any
}) => {
  let val = props.config.defaultValue
  if (isBoolean(val))
    return (
      <input
        className="mr-auto"
        type="checkbox"
        checked={props.newVal ?? val}
        onChange={(e) => {
          props.onChange((e.target as HTMLInputElement).checked)
        }}
      />
    )
  return (
    <input
      className="h-[24px] text-[14px] px-[8px]"
      value={props.newVal ?? val}
      onInput={(e) => {
        props.onChange((e.target as HTMLInputElement).value)
      }}
    />
  )
}

export const saveKey = '__settingPanel_config_save'
const UIComponent: FC<Props> = (props) => {
  let [isLoading, setLoading] = useState(props.isLoading)
  let [savedConfig, setSavedConfig] = useState<Partial<BaseConfig>>(
    props.savedConfig
  )
  useOnce(async () => {
    ;(globalThis as any).__spSetLoading = setLoading
    ;(globalThis as any).__spSetSavedConfig = setSavedConfig
    return () => {
      delete (globalThis as any).__spSetLoading
      delete (globalThis as any).__spSetSavedConfig
    }
  })

  return (
    <LoadingContainer isLoading={isLoading}>
      <SettingPanel {...props} savedConfig={savedConfig} />
    </LoadingContainer>
  )
}
export default UIComponent
