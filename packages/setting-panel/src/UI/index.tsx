import type { Rec } from '@pkgs/tsconfig/types/global'
import type { FC } from 'preact/compat'
import type { ConfigField, I18n, InitOptions } from '../types'
import { classNames } from '@pkgs/utils/src/utils'
import { useMemo, useState } from 'preact/hooks'
import LoadingContainer from '../components/LoadingContainer'
import ShadowRootContainer from '../components/ShadowRootContainer'
import { useMemoizedFn, useOnce, useUpdate } from '../hooks'
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
  i18n: I18n
  onClose: () => void
  isModal?: boolean
  styleHref?: string
  config: { isLoading: boolean }
  saveConfig: () => void
} & InitOptions<Record<string, any>>

const SettingPanel: FC<Props> = (props) => {
  const _saveConfig = props.saveConfig
  const savedConfig = props.savedConfig!
  const newConfig = props.savedConfig!
  const update = useUpdate()

  useOnce(() => {
    window.__spUpdate = update
    return () => {
      delete window.__spUpdate
    }
  })
  // useEffect(() => {
  //   Object.keys(props.configStore).forEach((key) => {
  //     const val = props.configStore[key]
  //     console.log('val', key, val)
  //   })
  //   update()
  // }, [props.configStore])

  const setNewConfig = useMemoizedFn((key: string, val: any) => {
    if (props.changeConfigStoreWithSettingPanelChange)
      props.configStore[key] = val

    savedConfig[key] = val
    update()
    saveConfig()
  })
  const resetConfig = useMemoizedFn((key: string) => {
    delete newConfig[key]
    if (props.changeConfigStoreWithSettingPanelChange) {
      props.configStore[key]
        = props.settings[key].defaultValue ?? props.settings[key]
    }
    update()
    saveConfig()
  })

  const saveConfig = useMemoizedFn(() => {
    if (!props.autoSave)
      return
    _saveConfig()
  })

  const {
    baseConfig,
    advConfig,
    cateBaseConfig,
    cateAdvConfig,
    advConfigEntries,
    // baseConfigEntries,
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
        <LoadingContainer isLoading={props.config.isLoading}>
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
                config={nowConfig}
                newConfig={newConfig}
                setNewConfig={setNewConfig}
                resetConfig={resetConfig}
              />
              {showAdv && (
                <Summary title={props.i18n.noRecommended} open={false}>
                  <ConfigEntriesBox
                    i18n={props.i18n}
                    config={nowAdvConfig}
                    newConfig={newConfig}
                    setNewConfig={setNewConfig}
                    resetConfig={resetConfig}
                  />
                </Summary>
              )}
            </div>
          </div>
        </LoadingContainer>

      </div>
    )
  }

  return (
    <div className="setting-panel one-type">
      <ConfigEntriesBox
        i18n={props.i18n}
        config={baseConfig}
        newConfig={newConfig}
        setNewConfig={setNewConfig}
        resetConfig={resetConfig}
      />
      {!!showAdv && (
        <Summary title={props.i18n.noRecommended} open={false}>
          <ConfigEntriesBox
            i18n={props.i18n}
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
export const Summary: FC<{
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

const ShouldShadowRootContainer: FC<Props> = (props) => {
  const children = props.children
  if (props.useShadowDom)
    return <ShadowRootContainer>{children}</ShadowRootContainer>
  return children as any
}

const UIComponent: FC<Props> = (props) => {
  // 放这是因为在render那的observer是不会生效的，这里最外层也是只会运行一次
  const SettingPanel2 = props.mobx.observer(SettingPanel)

  return (
    <ShouldShadowRootContainer {...props}>
      <div className={classNames(`render-root`, props.isModal && 'is-modal')}>
        <SettingPanel2
          {...props}
          savedConfig={props.savedConfig}
        />
        {props.isModal && <div className="cover-bg" onClick={props.onClose}></div>}
        {props.styleHref && <link rel="stylesheet" type="text/css" href={props.styleHref} />}
      </div>
    </ShouldShadowRootContainer>
  )
}

export default UIComponent
