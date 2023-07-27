import { getClientRect, wait } from '@pkgs/utils/src/utils'
import { useEventListener } from 'ahooks'
import classNames from 'classnames'
import { isArray, isEqual } from 'lodash-es'
import React, {
  Children,
  FC,
  ReactNode,
  cloneElement,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'

// TODO 这个选择有点难度，选择完毕的操作栏都要放在右边
// /**返回的以左上角为0,0，x1为最小，x2为最大 */
// function calcSelectionPos(): {
//   x1: number
//   x2: number
//   y1: number
//   y2: number
// } {
//   const selection = getSelection()
//   const startEl = selection.anchorNode,
//     startIndex = selection.anchorOffset,
//     startElIsText = startEl instanceof Text,
//     endEl = selection.focusNode,
//     endIndex = selection.focusOffset,
//     endElIsText = endEl instanceof Text

//   const startHEEl = startElIsText
//       ? startEl.parentElement
//       : (startEl as HTMLElement),
//     endHEEl = endElIsText ? endEl.parentElement : (endEl as HTMLElement)
//   const startRect = getClientRect(startHEEl),
//     endRect = getClientRect(endHEEl)

//   // const commonParent = getCommonParent(endEl, startEl)
//   // console.log('commonParent',commonParent)
// }
/**距离出边界的差值 */
const OUTSIDE_OFFSET = 10
// TODO 限制只在一个区域内选择，外头双击到里面的不算
type Props = {
  children: ReactNode
  onSelected?: (data: { selection: Selection }) => void
  menu: (data: { string: string }) => ReactNode
  menuClassName?: string
  getContainer?: (triggerNode: HTMLElement) => HTMLElement
  offset?: [number, number]
}
const SelectionContainer: FC<Props> = (props) => {
  const { offset = [0, 0] } = props
  let childRef = useRef<HTMLElement>()
  let [isSelecting, setSelecting] = useState(false)
  let selectionRef = useRef<{
    selection: Selection
    // string: string
    x: number
    y: number
  }>()
  let [string, setString] = useState('')
  let [popupRect, setPopupRect] = useState<{ width: number; height: number }>()

  useEventListener(
    'mouseup',
    async (e) => {
      if (e.button !== 0) return
      let { pageX: x, pageY: y } = e
      setSelecting(false)
      await wait()
      // console.log('mouseup selection', getSelection())
      let selection = getSelection()
      selectionRef.current = {
        selection,
        // string: selection.toString().trim(),
        x,
        y,
      }
      // console.log('mouseup', selection.toString())
      setString(selection.toString().trim())
      // if (!isSelecting) return
      props.onSelected?.({ selection })

      function clearSelection() {
        setString('')
        window.removeEventListener('click', clearSelection)
      }
      window.addEventListener('click', clearSelection)
    },
    {
      target: props.getContainer?.(childRef.current) ?? childRef.current,
    }
  )

  useEventListener(
    'mousedown',
    (e) => {
      if (e.button !== 0) return
      // console.log('mousedown', e)
      setSelecting(true)
    },
    { target: props.getContainer?.(childRef.current) ?? childRef.current }
  )

  if (isArray(props.children)) throw new Error('不要传数组children给该组件')

  let top = selectionRef.current?.y + offset[1],
    left = selectionRef.current?.x + offset[0]
  // 处理超出视窗的情况
  if (popupRect) {
    if (top + popupRect.height + OUTSIDE_OFFSET >= window.innerHeight)
      top = selectionRef.current.y - popupRect.height - offset[1]
    if (left + popupRect.width + OUTSIDE_OFFSET >= window.innerWidth)
      left = selectionRef.current.x - popupRect.width - offset[0]
  }
  return (
    <>
      {string &&
        props.menu &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              top,
              left,
            }}
            className={classNames(props.menuClassName)}
          >
            {cloneElement(props.menu({ string }) as any, {
              ref: (ref: HTMLElement) => {
                const rect = getClientRect(ref)
                if (!rect) return
                const { width, height } = rect
                if (isEqual({ width, height }, popupRect)) return
                setPopupRect({ width, height })
              },
            })}
          </div>,
          childRef.current
        )}
      {Children.map(props.children, (child, index) =>
        cloneElement(child as any, {
          ref: (ref: any) => {
            childRef.current = ref
          },
        })
      )}
    </>
  )
}

export default SelectionContainer
