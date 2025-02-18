import type { FC } from 'preact/compat'
import type { JSXInternal } from 'preact/src/jsx'
import type { ConfigEntries, UISettings } from '.'
import type { ConfigField, I18n } from '../types'
import {
  arrayInsert,
  classNames,
  isArray,
  isBoolean,
  isEqual,
  isFunction,
  isUndefined,
  wait,
} from '@pkgs/utils/src/utils'
import { useRef } from 'preact/hooks'
import { getPureKeyValueMap } from '..'
import ArrayInput from './ArrayInput'
import MapInput from './MapInput'

export const ConfigEntriesBox: FC<{
  config: ConfigEntries
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
        const hasChange
          = !isUndefined(props.newConfig[key])
          && !isEqual(
            props.newConfig[key],
            defaultValue,
          )

        const isRelChild = !!val.relateBy
        if (isRelChild) {
          if (isFunction(val.relateBy)) {
            if (!val.relateBy(getPureKeyValueMap({ ...props.config, ...props.newConfig })))
              return null
          }
          else {
            const tar = props.config[val.relateBy]
            const tarDefaultValue = tar.defaultValue ?? tar
            const tarVal = props.newConfig[val.relateBy] ?? tarDefaultValue
            if (tarVal !== val.relateByValue)
              return null
          }
        }

        return (
          <div
            className={classNames(
              `group py-[6px] px-[6px] relative bg-white odd:bg-gray-200 `,
              isRelChild && 'rel-child',
            )}
            key={i}
          >
            <div className="gap-[12px] flex">
              <div
                className={classNames(
                  `items-center justify-center text-center w-[140px] whitespace-pre-wrap`,
                  hasChange && 'text-blue-500',
                )}
              >
                {' '}
                {val?.label ?? key}
                :
              </div>
              <div className="flex flex-1 flex-col">
                <div className="flex gap-[12px]">
                  <div className="flex flex-1 items-center justify-center gap-[12px]">
                    <ConfigRowAction
                      config={val}
                      onChange={(v) => {
                        props.setNewConfig(key, v)
                      }}
                      newVal={(props.newConfig)[key]}
                    />
                  </div>
                  <div
                    className={`flex items-center justify-center opacity-0 ${
                      hasChange && 'group-hover:opacity-100'
                    } transition-all`}
                  >
                    <button
                      className={classNames('reset')}
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

const ConfigRowAction: FC<{
  config: ConfigField<any>
  onChange: (v: any) => void
  newVal: any
}> = (props) => {
  const defaultValue = props.config.defaultValue ?? props.config
  const value = props.newVal ?? defaultValue
  const isNumber = typeof defaultValue == 'number'

  type El = HTMLInputElement | HTMLSelectElement
  const onChange = (e: JSXInternal.TargetedEvent<El, Event>) => {
    const target = e.target as HTMLInputElement
    if (target.type === 'checkbox')
      return props.onChange(target.checked)
    props.onChange(isNumber ? Number(target.value) : target.value)
  }

  switch (props.config?.type) {
    case 'group':
      return (
        <select value={value} onChange={onChange}>
          {props.config.group.map((val: any, i: number) => {
            // const isAdvVal = !isObject(val)
            const value = val?.value ?? val
            const label = val?.label ?? value
            return (
              <option key={i} value={value} title={val?.desc}>
                {label}
                {' '}
                {!!val?.desc && '*'}
              </option>
            )
          })}
        </select>
      )

    case 'color':
      return (
        <div className="row">
          <input type="color" value={value} onChange={onChange} />
          <input value={value} onChange={onChange} />
        </div>
      )
    case 'range':
      // eslint-disable-next-line no-case-declarations
      const [min, max] = props.config.range
      // eslint-disable-next-line no-case-declarations
      const step = props.config.rangeStep ?? max / 100
      return (
        <div className="row">
          <input type="range" min={min} max={max} value={value} step={step} onChange={onChange} className="max-w-[50%]" />
          <input className="flex-1" value={value} onChange={onChange} step={step} style={{ maxWidth: 56 }} type="number" />
        </div>
      )
    case 'map':
      return <MapInput config={props.config} defaultValue={defaultValue} onChange={props.onChange} value={value} />
  }

  if (isBoolean(value)) {
    return (
      <input
        className="mr-auto"
        type="checkbox"
        checked={value}
        onChange={onChange}
      />
    )
  }
  if (isArray(value)) {
    return <ArrayInput value={value} onChange={props.onChange} />
  }

  return (
    <input
      type={isNumber ? 'number' : 'text'}
      className="input"
      value={value}
      onInput={onChange}
      onBlur={onChange}
      onKeyDown={e => e.stopPropagation()}
    />
  )
}
