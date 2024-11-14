import type { ResizableProps } from 're-resizable'
import type { FC, ReactNode } from 'react'
import { Resizable } from 're-resizable'
import React, { useMemo, useRef } from 'react'

type Enable = ResizableProps['enable']
type Props = {
  children: ReactNode
  /** enable的反向设置，只开启指定反向 */
  enableDirection?: (keyof Enable)[]
  /** 禁用resize方向调整大小 */
  disableResizeDir?: 'x' | 'y'
} & ResizableProps
const ResizeContainer: FC<Props> = (props) => {
  const { onResizeStart, onResizeStop, disableResizeDir, ..._props } = props
  const originWH = useRef<{ width: number, height: number }>({
    width: 0,
    height: 0,
  })
  const enable: Enable = useMemo(() => {
    if (props.enable)
      return props.enable
    if (props.enableDirection) {
      return props.enableDirection.reduce((rs, val) => {
        rs[val] = true
        return rs
      }, {} as Record<string, boolean>)
    }
    return null
  }, [props.enable, props.enableDirection])

  return (
    <Resizable
      onResizeStart={(e, dir, ref) => {
        Object.assign(originWH.current, {
          width: ref.offsetWidth,
          height: ref.offsetHeight,
        })
        onResizeStart?.(e, dir, ref)
      }}
      onResizeStop={(e, direction, ref, d) => {
        disableResizeDir !== 'y'
        && (ref.style.height = `${originWH.current.height + d.height}px`)
        disableResizeDir !== 'x'
        && (ref.style.width = `${originWH.current.width + d.width}px`)
        onResizeStop?.(e, direction, ref, d)
      }}
      {...(enable ? { enable } : {})}
      {..._props}
    >
      {props.children}
    </Resizable>
  )
}

export default ResizeContainer
