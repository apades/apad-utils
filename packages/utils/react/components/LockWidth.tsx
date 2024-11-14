import type { FC, ReactNode } from 'react'
import { isArray, isUndefined } from 'lodash-es'
import React, { Children, cloneElement, useEffect, useRef } from 'react'

export interface Props {
  children: ReactNode
  /** 用来控制设置width的时机的 */
  init?: boolean
}

/** 锁住width的组件，例如有些组件切换状态要换文字，会导致挨着这个组件的其他组件位置跟着变动 */
const LockWidth: FC<Props> = (props) => {
  const childRef = useRef<HTMLElement>()
  useEffect(() => {
    if (!childRef.current)
      return
    if (!(childRef.current instanceof HTMLElement)) {
      console.error('请传HTMLElement包裹的children')
      throw new Error('请传HTMLElement包裹的children')
    }

    // 不加1用它改的clientWidth会导致文字换行，很奇怪
    if (isUndefined(props.init)) {
      childRef.current.style.width = `${childRef.current.clientWidth + 1}px`
      return
    }
    if (!props.init)
      return
    childRef.current.style.width = `${childRef.current.clientWidth + 1}px`
  }, [props.init, childRef.current])

  if (isArray(props.children))
    throw new Error('不要传数组children给该组件')

  return (
    <>
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

export default LockWidth
