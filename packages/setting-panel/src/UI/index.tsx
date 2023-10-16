import {
  classNames,
  debounce,
  isBoolean,
  isEqual,
  isUndefined,
} from '@pkgs/utils/src/utils'
import type { FC } from 'preact/compat'
import { useCallback, useEffect, useMemo, useState } from 'preact/hooks'
import { ConfigField, I18n, InitOptions } from '..'
import LoadingContainer from '../components/LoadingContainer'
import { useMemoizedFn, useOnce } from '../hooks'
import { Rec } from '../../../tsconfig/types/global'

type ConfigEntries = Rec<ConfigField<any>>
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
  i18n: I18n
} & InitOptions<Record<string, any>>

const SettingPanel: FC<Props> = (props) => {
  let [newConfig, _setNewConfig] = useState<Partial<BaseConfig>>({})
  useEffect(() => {
    if (props.savedConfig) _setNewConfig(props.savedConfig)
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
    if (props.onSave) {
      const newSaveData = await props.onSave({ ...newConfig })
      if (!newSaveData) return
      // 会不会出现对象地址问题
      const changes = Object.entries(newSaveData).filter(
        ([key, val]) => val != newConfig[key]
      )
      if (!changes.length) return
      changes.forEach((key, val) => setNewConfig(key as any, val))
    }
    // toast({ title: '保存成功', status: 'success' })
  })
  const saveConfig = useCallback(
    debounce(_saveConfig, props.autoSaveTriggerMs),
    []
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
    const baseConfig: ConfigEntries = {},
      advConfig: ConfigEntries = {},
      cateBaseConfig: Record<string, ConfigEntries> = {},
      cateAdvConfig: Record<string, ConfigEntries> = {}

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
        } else {
          cateBaseConfig[category] ??= {}
          cateBaseConfig[category][key] = val
        }
      } else {
        if (val.notRecommended) {
          advConfig[key] = val
          // advConfigEntries.push([key, val])
        } else {
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

  const showAdv = advConfigEntries.length || cateAdvConfigEntries.length

  return (
    <>
      {cateBaseConfigEntries.map(([key, val]) => {
        return (
          <Summary key={key} title={key}>
            <ConfigEntriesBox
              i18n={props.i18n}
              tempConfigKeys={props.tempConfigKeys}
              config={val}
              newConfig={newConfig}
              setNewConfig={setNewConfig}
              resetConfig={resetConfig}
            />
          </Summary>
        )
      })}
      <ConfigEntriesBox
        i18n={props.i18n}
        tempConfigKeys={props.tempConfigKeys}
        config={baseConfig}
        newConfig={newConfig}
        setNewConfig={setNewConfig}
        resetConfig={resetConfig}
      />
      {showAdv && (
        <Summary title={props.i18n.noRecommended} open={false}>
          {cateAdvConfigEntries.map(([key, val]) => {
            return (
              <Summary key={key} title={key}>
                <ConfigEntriesBox
                  i18n={props.i18n}
                  tempConfigKeys={props.tempConfigKeys}
                  config={val}
                  newConfig={newConfig}
                  setNewConfig={setNewConfig}
                  resetConfig={resetConfig}
                />
              </Summary>
            )
          })}
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
    </>
  )
}
const Summary: FC<{
  children: (JSX.Element | JSX.Element[])[] | JSX.Element
  title: string
  open?: boolean
}> = (props) => {
  return (
    <details
      className="mb-4 border-solid border border-black"
      open={props.open ?? true}
    >
      <summary className="select-none cursor-pointer">{props.title}</summary>
      {props.children}
    </details>
  )
}

const ConfigEntriesBox: FC<{
  config: ConfigEntries
  tempConfigKeys: string[]
  newConfig: Partial<UISettings>
  setNewConfig: (key: string, val: any) => void
  resetConfig: (key: string) => void
  i18n: I18n
}> = (props) => {
  const configEntries = Object.entries(props.config)
  return (
    <div>
      {configEntries.map(([key, val]: [string, ConfigField<any>], i) => {
        const defaultValue = val.defaultValue ?? val
        const isNumber = typeof defaultValue == 'number'
        const hasChange =
          !isUndefined(props.newConfig[key]) &&
          !isEqual(
            props.newConfig[key],
            isNumber ? defaultValue + '' : defaultValue
          )
        const isTemp = props.tempConfigKeys.includes(key)
        let tempTips = isTemp ? [props.i18n.tempSetTips] : []

        const isRelChild = !!val.relateBy
        if (isRelChild) {
          const tar = props.config[val.relateBy]
          const tarDefaultValue = tar.defaultValue ?? tar
          const tarVal = props.newConfig[val.relateBy] ?? tarDefaultValue
          if (tarVal != val.relateByValue) return null
        }

        return (
          <div
            className={classNames(
              `group py-[6px] px-[6px] relative`,
              i % 2 == 0 ? 'bg-gray-200' : 'bg-white',
              isRelChild && 'rel-child'
            )}
            key={i}
            title={tempTips.length ? tempTips.join('\n') : undefined}
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
                      {props.i18n.reset}
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
