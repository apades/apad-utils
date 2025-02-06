import type { ConfigField } from '../types'
import { arrayInsert, isArray } from '@pkgs/utils/src/utils'
import { type FC, Fragment } from 'preact/compat'
import { useRef } from 'preact/hooks'
import { Summary } from '.'
import { getPureKeyValueMap } from '..'

interface MapItemsRef {
  keyInput: HTMLInputElement
  values: { key: string, input: HTMLInputElement }[]
}
interface MapInputProps {
  config: ConfigField<any>
  value: any
  defaultValue: any
  onChange: (v: any) => void
}
const MapInput: FC<MapInputProps> = (props) => {
  const { config } = props
  const { defaultItem } = props.config
  // const isArrayItem = isArray(defaultItem)
  const mapInputRefs = useRef<MapItemsRef[]>([])

  const getValues = () => Object.fromEntries(
    mapInputRefs.current.filter(v => !!v.keyInput).map((v) => {
      const values = Object.fromEntries(
        v.values.map(v => [v.key, v.input?.value]),
      )
      return [v.keyInput.value, values]
    }),
  )

  const changeVal = () => props.onChange(getValues())
  const add = () => {
    let index = Object.keys(props.value).length + 1
    const v = getValues()
    while (true) {
      if (!v[`newKey${index}`]) {
        break
      }
      index++
    }
    props.onChange(
      {
        ...v,
        [`newKey${index}`]: getPureKeyValueMap(defaultItem),
      },
    )
  }

  return (
    <div className="w-full">
      {
        Object.entries(props.value).map(([mapKey, mapValue]: [string, any], mapIndex) => {
          const mapKeyLabel = config?.mapKeyLabel ?? 'key'
          const remove = () => {
            mapInputRefs.current.splice(mapIndex, 1)
            props.onChange(getValues())
          }
          return (
            <Summary
              key={mapIndex}
              open={false}
              title={mapKey}
            >
              {/* mapKey */}
              <div className="row">
                <div>{mapKeyLabel}</div>
                <input
                  className="w-[100px] flex-1"
                  value={mapKey}
                  ref={(ref) => {
                    mapInputRefs.current[mapIndex] ??= { keyInput: ref, values: [] }
                    mapInputRefs.current[mapIndex].keyInput = ref
                  }}
                  onChange={changeVal}
                />
                <button onClick={remove}>x</button>
              </div>
              <div className="bg-gray-400 w-f grid grid-cols-[auto,1fr]">
                {
                  Object.entries(mapValue).map(([key, value]: [string, any], i) => {
                    const label = defaultItem[key]?.label || key

                    return (
                      <Fragment key={i}>
                        <div className="flex-1 overflow-hidden text-ellipsis" title={label}>{label}</div>
                        <input
                          value={value}
                          ref={(ref) => {
                            mapInputRefs.current[mapIndex].values[i] ??= { key, input: ref }
                          }}
                          onChange={changeVal}
                          className="flex-1"
                        />
                      </Fragment>
                    )
                  })
                }
              </div>

            </Summary>
          )
        })
      }
      {/* {
        Object.entries(defaultItem).map(([key, value]: [string, any]) => {
          const label = value?.label || key
        })
      } */}
      <div>
        <button
          onClick={add}
        >
          +
        </button>
      </div>
    </div>
  )
}

export default MapInput
