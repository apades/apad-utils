import { Rec } from '@pkgs/tsconfig/types/global'
import { classNames } from '@pkgs/utils/src/utils'
import type { FC } from 'preact/compat'
import { useMemo, useState } from 'preact/hooks'
import LoadingContainer from '../components/LoadingContainer'
import { ConfigField, I18n, InitOptions } from '../types'
import { ConfigEntriesBox } from './ConfigEntriesBox'
import './index.less'
import { MOBX_LOADING } from '../keys'

export type ConfigEntries = Rec<ConfigField<any>>
export type BaseConfig = UISettings

export type UISettings = {
  [K: string]: ConfigField<any>
}
export type Props = {
  settings: UISettings
  configStore: Record<string, any>
  i18n: I18n
  observer: any
} & InitOptions<Record<string, any>>

const SettingPanel: FC<Props> = (props) => {
  const { configStore } = props

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
      if (key == MOBX_LOADING) return
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

  const [nowCategory, setNowCategory] = useState(props.i18n.main)

  const showAdv = advConfigEntries.length || cateAdvConfigEntries.length

  if (cateBaseConfigEntries.length) {
    const isMain = nowCategory == props.i18n.main
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
            {[[props.i18n.main], ...cateBaseConfigEntries].map(([key, val]) => (
              <div
                key={key}
                className={classNames(nowCategory == key && 'active')}
                onClick={handleLeftClick(key)}
              >
                {key}
              </div>
            ))}
          </div>
          <div className="right">
            <ConfigEntriesBox
              configStore={configStore}
              i18n={props.i18n}
              settings={nowConfig}
              observer={props.observer}
            />
            {showAdv && (
              <Summary title={props.i18n.noRecommended} open={false}>
                <ConfigEntriesBox
                  configStore={configStore}
                  i18n={props.i18n}
                  settings={nowAdvConfig}
                  observer={props.observer}
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
        configStore={configStore}
        settings={baseConfig}
        observer={props.observer}
      />
      {!!showAdv && (
        <Summary title={props.i18n.noRecommended} open={false}>
          <ConfigEntriesBox
            i18n={props.i18n}
            configStore={configStore}
            settings={advConfig}
            observer={props.observer}
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
  return (
    <LoadingContainer isLoading={props.configStore[MOBX_LOADING]}>
      <SettingPanel {...props} />
    </LoadingContainer>
  )
}
export default UIComponent
