import type { FC } from 'preact/compat'
import { wait } from '@pkgs/utils/main'
import { arrayInsert } from '@pkgs/utils/src/utils'
import { useRef } from 'preact/hooks'

interface ArrayInputProps {
  value: any[]
  onChange: (v: any) => void
}
const ArrayInput: FC<ArrayInputProps> = (props) => {
  const { value } = props
  const arrInputRefs = useRef<HTMLInputElement[]>([])
  const getValues = () =>
    arrInputRefs.current.filter(e => !!e).map(el => el?.value || '')

  const add = (index: number) =>
    props.onChange(arrayInsert(getValues(), index + 1, ['']))

  return (
    <div className="arr-row">
      {value.map((v: any, i: number) => {
        const remove = () => {
          arrInputRefs.current.splice(i, 1)
          arrInputRefs.current[i - 1]?.focus()
          props.onChange(getValues())
        }
        return (
          <div key={i}>
            <input
              key={i}
              ref={ref => (arrInputRefs.current[i] = ref)}
              value={value[i]}
              onChange={(e) => {
                value[i] = (e.target as HTMLInputElement).value
                props.onChange(getValues())
              }}
              onKeyDown={async (e) => {
                if (e.composed)
                  return
                switch (e.code) {
                  case 'Enter':
                    e.preventDefault()
                    add(i)
                    await wait()
                    arrInputRefs.current[i + 1]?.focus()
                    break
                  case 'Backspace':
                    if ((`${v}`).length)
                      return
                    e.preventDefault()
                    remove()
                    break
                  case 'ArrowUp':
                    arrInputRefs.current[i - 1]?.focus()
                    break
                  case 'ArrowDown':
                    arrInputRefs.current[i + 1]?.focus()
                }
              }}
            />
            <button onClick={remove}>x</button>
          </div>
        )
      })}
      <div>
        <button
          onClick={() => {
            add(value.length)
          }}
        >
          +
        </button>
      </div>
    </div>
  )
}

export default ArrayInput
