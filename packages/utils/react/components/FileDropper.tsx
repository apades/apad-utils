import type {
  FC,
  ReactNode,
} from 'react'
import { getClientRect } from '@pkgs/utils/src/utils'
import { useEventListener } from 'ahooks'
import { isArray } from 'lodash-es'
import React, {
  Children,
  cloneElement,
  useEffect,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import './index.less'

interface Props {
  children: ReactNode
  /** dragoverRender和drop事件挂载在body上 */
  global?: boolean
  /** 处理drop事件 */
  handleDrop?: (dataTransfer: DataTransfer, e: DragEvent) => void
  /** darg进来渲染样式，盖在children上 */
  dragoverRender?: ReactNode
  // accept?: string | string[]
  // maxCount?: number
  disable?: boolean
}

/** 拖拽文件进来的handler组件 */
const FileDropper: FC<Props> = (props) => {
  const childRef = useRef<HTMLElement>()
  const coverRef = useRef<HTMLDivElement>()
  const [isDragover, setDragover] = useState(false)
  const [rect, setRect] = useState<DOMRect>()
  const leaveTimer = useRef<NodeJS.Timeout>()

  const isGlobal = props.global
  const target = props.global ? document.body : childRef.current

  useEffect(() => {
    if (!childRef.current /* || !props.global */)
      return
    // console.log('childRef', childRef.current, target)
  }, [childRef.current])

  useEventListener(
    'dragenter',
    (e) => {
      if (props.disable)
        return
      //   console.log('enter')
      if (!e.dataTransfer.types.includes('Files'))
        return
      setDragover(true)
      clearTimeout(leaveTimer.current)
      if (isGlobal)
        return
      setRect(getClientRect(target))
    },
    { target },
  )

  useEventListener(
    'dragleave',
    () => {
      //   console.log('leave')
      leaveTimer.current = setTimeout(() => {
        setDragover(false)
      }, 50)
    },
    { target: coverRef.current },
  )
  useEventListener(
    'dragover',
    (e) => {
      if (!e.dataTransfer.types.includes('Files'))
        return
      e.preventDefault()
      clearTimeout(leaveTimer.current)
    },
    { target: coverRef.current },
  )

  useEventListener(
    'drop',
    (e) => {
      if (!e.dataTransfer.types.includes('Files'))
        return
      e.preventDefault()
      setDragover(false)
      // if (props.accept) {
      //   let accept = isArray(props.accept) ? props.accept : [props.accept]
      //   // for(let i = 0;i<e.dataTransfer.files.length;i++ ){
      //   //   let file = e.dataTransfer.files[i]
      //   //   if(accept.includes(file.type))
      //   // }
      //   for (let file of e.dataTransfer.files) {
      //     if (!accept.includes(file.type)) return
      //   }
      // }
      props.handleDrop(e.dataTransfer, e)
    },
    { target: coverRef.current },
  )

  if (isArray(props.children))
    throw new Error('不要传数组children给该组件')
  return (
    <>
      {props.dragoverRender
      && isDragover
      && createPortal(
        <div
          className="dragover-cover fixed left-0 top-0 w-full h-full z-10"
          style={
            isGlobal
              ? {}
              : {
                  top: rect?.top,
                  left: rect?.left,
                  height: rect?.height,
                  width: rect?.width,
                }
          }
          ref={coverRef}
        >
          {props.dragoverRender}
        </div>,
        document.body,
      )}
      {Children.map(props.children, child =>
        // eslint-disable-next-line react/no-clone-element
        cloneElement(child as any, {
          ref: (ref: any) => {
            childRef.current = ref
          },
        }))}
    </>
  )
}

export default FileDropper
