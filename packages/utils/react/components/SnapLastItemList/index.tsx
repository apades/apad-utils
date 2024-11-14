/* eslint-disable react-dom/no-dangerously-set-innerhtml */
import type {
  DetailedHTMLProps,
  HTMLAttributes,
  ReactNode,
} from 'react'
import { useScroll } from 'ahooks'
import classNames from 'classnames'
import React, {
  forwardRef,
  useEffect,
  useRef,
} from 'react'
import './index.less'

export type Props = { children: ReactNode } & DetailedHTMLProps<
  HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>
const SnapLastItemList = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const listRef = useRef<HTMLDivElement>()
  const pos = useScroll(listRef.current)
  // ! window的缩放屏幕和mac奇妙的会导致scrollTop不对，少了0.几
  const isEnd = !listRef.current
    ? false
    : ~~(pos?.top + listRef.current?.offsetHeight) + 3
      >= listRef.current?.scrollHeight

  useEffect(() => {
    if (typeof ref === 'object' && ref !== null) {
      ref.current = listRef.current
    }
    else if (typeof ref === 'function') {
      ref(listRef.current)
    }
  }, [ref])

  return (
    <div
      {...props}
      className={classNames('snap-container', props.className)}
      ref={listRef}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `.snap-container > *:last-child{
        ${isEnd
      ? `
        scroll-margin-block-end: 5rem;
        scroll-snap-align: end;`
      : ``
    }
      }`,
        }}
      >
      </style>
      {props.children}
    </div>
  )
})

export default SnapLastItemList
