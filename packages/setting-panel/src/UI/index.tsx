import {
  classNames,
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
  tempConfigKeys?: string[]
  rootEl?: HTMLElement | ShadowRoot
  isLoading: boolean
} & InitOptions<Record<string, any>>

const SettingPanel: FC<Props> = (props) => {
  let [newConfig, _setNewConfig] = useState<Partial<BaseConfig>>({})
  useEffect(() => {
    if (props.savedConfig) _setNewConfig(props.savedConfig)
  }, [props.savedConfig])
  // window.newConfig = newConfig
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
      props.configStore[key] =
        props.settings[key].defaultValue ?? props.settings[key]
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
    const val = {
      ..._val,
      defaultValue: props.settings[key].defaultValue ?? props.settings[key],
    }
    if (val.notRecommended) advConfigEntries.push([key, val])
    else baseConfigEntries.push([key, val])
  })

  return (
    <ConfigEntriesBox
      tempConfigKeys={props.tempConfigKeys}
      config={baseConfigEntries}
      newConfig={newConfig}
      setNewConfig={setNewConfig}
      resetConfig={resetConfig}
    />
  )
}

const ConfigEntriesBox: FC<{
  config: ConfigEntries
  tempConfigKeys: string[]
  newConfig: Partial<UISettings>
  setNewConfig: (key: string, val: any) => void
  resetConfig: (key: string) => void
}> = (props) => {
  return (
    <div>
      {props.config.map(([key, val]: [string, ConfigField<any>], i) => {
        const defaultValue = val.defaultValue ?? val
        const isNumber = typeof defaultValue == 'number'
        const hasChange =
          !isUndefined(props.newConfig[key]) &&
          !isEqual(
            props.newConfig[key],
            isNumber ? defaultValue + '' : defaultValue
          )
        const isTemp = props.tempConfigKeys.includes(key)
        const tempTips = isTemp
          ? '这是针对当前 页面/状态 的特殊更改，不建议修改该配置'
          : undefined

        return (
          <div
            className={`group py-[6px] px-[6px] ${
              i % 2 == 0 ? 'bg-gray-200' : 'bg-white'
            }`}
            key={i}
            title={tempTips}
          >
            <div className="gap-[12px] flex">
              <div
                className={classNames(
                  `items-center justify-center text-center w-[140px] whitespace-pre-wrap`,
                  hasChange && 'text-blue-500',
                  isTemp && 'text-yellow-500 cursor-help'
                )}
              >
                {isTemp && '~'} {val.label ?? key}:
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
                      className={classNames(
                        'h-[24px]',
                        isTemp ? 'bg-yellow-500' : 'bg-red-500'
                      )}
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
  let defaultValue = props.config.defaultValue ?? props.config,
    isNumber = typeof props.config.defaultValue == 'number'

  const value = props.newVal ?? defaultValue
  if (props.config?.type == 'group')
    return (
      <select
        className="h-[24px] min-w-[120px]"
        value={value}
        onChange={(e) => props.onChange((e.target as HTMLSelectElement).value)}
      >
        {props.config.group.map((val: any, i: number) => (
          <option key={i} value={val}>
            {val}
          </option>
        ))}
      </select>
    )
  if (isBoolean(defaultValue))
    return (
      <input
        className="mr-auto"
        type="checkbox"
        checked={value}
        onChange={(e) => {
          props.onChange((e.target as HTMLInputElement).checked)
        }}
      />
    )
  return (
    <input
      className="h-[24px] text-[14px] px-[8px]"
      value={value}
      onInput={(e) => {
        let val = (e.target as HTMLInputElement).value
        props.onChange(val)
      }}
      onBlur={(e) => {
        let val = (e.target as HTMLInputElement).value
        props.onChange(isNumber ? +val : val)
      }}
      onKeyDown={(e) => e.stopPropagation()}
    />
  )
}

export const saveKey = '__settingPanel_config_save'
const UIComponent: FC<Props> = (props) => {
  let [isLoading, setLoading] = useState(props.isLoading)
  let [savedConfig, setSavedConfig] = useState<Partial<BaseConfig>>(
    props.savedConfig
  )
  let [tempConfigKeys, setTempConfigKeys] = useState<string[]>([])
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
    <LoadingContainer isLoading={isLoading} className="setting-panel">
      <SettingPanel
        {...props}
        savedConfig={savedConfig}
        tempConfigKeys={tempConfigKeys}
      />
    </LoadingContainer>
  )
}
export default UIComponent
