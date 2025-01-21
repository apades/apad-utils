import type { FC } from 'preact/compat'
import type { ConfigField } from '../types'
import { arrayInsert, isArray } from '@pkgs/utils/src/utils'
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
    mapInputRefs.current.map((v) => {
      const values = Object.fromEntries(
        v.values.map(v => [v.key, v.input.value]),
      )
      return [v.keyInput.value, values]
    }),
  )

  const changeVal = () => props.onChange(getValues())
  const add = () => {
    props.onChange(
      {
        ...getValues(),
        [`newKey${Object.keys(props.value).length}`]: getPureKeyValueMap(defaultItem),
      },
    )
  }

  return (
    <div className="w-full">
      {
        Object.entries(props.value).map(([mapKey, mapValue]: [string, any], mapIndex) => {
          const mapKeyLabel = config?.mapKeyLabel ?? 'key'
          return (
            <Summary key={mapIndex} open={false} title={mapKey}>
              {/* mapKey */}
              <div className="row">
                {mapKeyLabel}
                :
                <input
                  className="ml-auto"
                  value={mapKey}
                  ref={(ref) => {
                    mapInputRefs.current[mapIndex] ??= { keyInput: ref, values: [] }
                    mapInputRefs.current[mapIndex].keyInput = ref
                  }}
                  onChange={changeVal}
                />
              </div>
              <div className="bg-gray-400">
                {
                  Object.entries(mapValue).map(([key, value]: [string, any], i) => {
                    const label = defaultItem[key]?.label || key

                    return (
                      <div className="row" key={i}>
                        {label}
                        :
                        <input
                          className="ml-auto"
                          value={value}
                          ref={(ref) => {
                            mapInputRefs.current[mapIndex].values[i] ??= { key, input: ref }
                          }}
                          onChange={changeVal}
                        />
                      </div>
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
