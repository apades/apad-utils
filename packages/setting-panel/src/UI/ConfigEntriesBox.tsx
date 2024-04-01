import {
  arrayInsert,
  classNames,
  isArray,
  isBoolean,
  isEqual,
  isObject,
  serialization,
  wait,
} from '@pkgs/utils/src/utils'
import type { FC } from 'preact/compat'
import { useMemo, useRef, useState } from 'preact/hooks'
import type { JSXInternal } from 'preact/src/jsx'
import type { ConfigEntries } from '.'
import type { ConfigField, I18n } from '../types'

/**中间的输入栏 */
const ConfigRowAction = (props: {
  config: ConfigField<any>
  onChange: (v: any) => void
  configStore: Record<string, any>
  idKey: string
}) => {
  const defaultValue = props.config.defaultValue ?? props.config,
    isNumber = typeof defaultValue == 'number'

  const [value, setValue] = useState(props.configStore[props.idKey])

  type El = HTMLInputElement | HTMLSelectElement
  const onChange = (e: JSXInternal.TargetedEvent<El, Event>) => {
    const target = e.target as HTMLInputElement
    let value: any = target.value
    if (target.type == 'checkbox') {
      value = target.checked
    }
    props.onChange(value)
    setValue(value)
    props.configStore[props.idKey] = value
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
        type="checkbox"
        checked={value}
        onChange={onChange}
        style={{ marginRight: 'auto' }}
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

export const ConfigEntriesBox: FC<{
  settings: ConfigEntries
  configStore: Record<string, any>
  i18n: I18n
}> = (props) => {
  const configEntries = Object.entries(props.settings)
  const { configStore } = props

  return (
    <div>
      {configEntries.map(([key, val]: [string, ConfigField<any>], i) => {
        const defaultValue = serialization(val.defaultValue ?? val)
        const hasChange = !isEqual(
          props.configStore[key] + '',
          defaultValue + ''
        )

        const isRelChild = !!val.relateBy
        if (isRelChild) {
          const tar = props.settings[val.relateBy]
          const tarDefaultValue = tar?.defaultValue ?? tar
          const tarVal = props.configStore[val.relateBy] ?? tarDefaultValue
          if (tarVal != val.relateByValue) return null
        }

        return (
          <div
            key={i}
            className={classNames(
              `config-row`,
              isRelChild && 'rel-child',
              hasChange && 'changed'
            )}
          >
            <div className={'config-key'}>{val.label ?? key}:</div>
            <div className="config-container">
              <div className="config-content">
                <div className="left">
                  {val?.render?.(configStore[key], (val: any) => {
                    configStore[key] = val
                  }) ?? (
                    <ConfigRowAction
                      config={val}
                      onChange={(v: any) => {
                        configStore[key] = v
                      }}
                      configStore={props.configStore}
                      idKey={key}
                    />
                  )}
                </div>
                <div className={`right`}>
                  <button
                    className={'reset'}
                    onClick={() => {
                      configStore[key] = defaultValue
                    }}
                  >
                    {props.i18n.reset}
                  </button>
                </div>
              </div>
              {val.desc && <div className="config-desc">{val.desc}</div>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
