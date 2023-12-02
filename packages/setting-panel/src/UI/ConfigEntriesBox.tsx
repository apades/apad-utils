import {
  classNames,
  isBoolean,
  isEqual,
  isUndefined,
  isObject,
  isArray,
  arrayInsert,
  wait,
} from '@pkgs/utils/src/utils'
import { FC } from 'preact/compat'
import { ConfigEntries, UISettings } from '.'
import { ConfigField, I18n } from '../types'
import { JSXInternal } from 'preact/src/jsx'
import { useRef, useState } from 'preact/hooks'

export const ConfigEntriesBox: FC<{
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
              `group py-[6px] px-[6px] relative bg-white odd:bg-gray-200 `,
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
                  <div className="flex flex-1 items-center justify-center">
                    <ConfigRowAction
                      config={val}
                      onChange={(v) => {
                        props.setNewConfig(key, v)
                      }}
                      newVal={(props.newConfig as any)[key]}
                    />
                  </div>
                  <div
                    className={`flex items-center justify-center opacity-0 ${
                      hasChange && 'group-hover:opacity-100'
                    } transition-all`}
                  >
                    <button
                      className={classNames('reset', isTemp && 'is-temp')}
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
    value = props.newVal ?? defaultValue,
    isNumber = typeof defaultValue == 'number'

  type El = HTMLInputElement | HTMLSelectElement
  const onChange = (e: JSXInternal.TargetedEvent<El, Event>) => {
    const target = e.target as HTMLInputElement
    if (target.type == 'checkbox') return props.onChange(target.checked)
    props.onChange(target.value)
  }

  const arrInputRefs = useRef<HTMLInputElement[]>([])

  if (props.config?.type == 'group') {
    return (
      <select value={value} onChange={onChange}>
        {props.config.group.map((val: any, i: number) => {
          const isAdvVal = !isObject(val)
          const value = val?.value ?? val,
            label = val.label ?? val
          return (
            <option key={i} value={value} title={val?.desc}>
              {label} {!!val?.desc && '*'}
            </option>
          )
        })}
      </select>
    )
  }
  if (props.config?.type == 'color') {
    return (
      <div className="color-row">
        <input type="color" value={value} onChange={onChange} />
        <input value={value} onChange={onChange} />
      </div>
    )
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
    const getValues = () =>
      arrInputRefs.current.filter((e) => !!e).map((el) => el?.value || '')
    return (
      <div className="arr-row">
        {value.map((v, i) => (
          <input
            key={i}
            ref={(ref) => (arrInputRefs.current[i] = ref)}
            value={value[i]}
            onChange={(e) => {
              value[i] = (e.target as HTMLInputElement).value
              props.onChange(getValues())
            }}
            onKeyDown={async (e) => {
              if (e.composed) return
              switch (e.code) {
                case 'Enter':
                  e.preventDefault()
                  props.onChange(arrayInsert(getValues(), i + 1, ['']))
                  await wait()
                  arrInputRefs.current[i + 1]?.focus()
                  break
                case 'Backspace':
                  if (v.length) return
                  e.preventDefault()
                  arrInputRefs.current.splice(i, 1)
                  arrInputRefs.current[i - 1]?.focus()
                  props.onChange(getValues())
                  break
                case 'ArrowUp':
                  arrInputRefs.current[i - 1]?.focus()
                  break
                case 'ArrowDown':
                  arrInputRefs.current[i + 1]?.focus()
              }
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <input
      type={isNumber ? 'number' : 'text'}
      className="input"
      value={value}
      onInput={onChange}
      onBlur={onChange}
      onKeyDown={(e) => e.stopPropagation()}
    />
  )
}
