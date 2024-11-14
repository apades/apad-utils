import type { FC, ReactNode } from 'react'
import classNames from 'classnames'
import React from 'react'
import './index.less'

export type Props = {
  children: ReactNode
  width?: number | string
  /** 例如(height)9 / (width)16 */
  bottomRatio: number
} & React.DetailedHTMLProps<
  React.ImgHTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>

/**
 * 根据width和width比例自动调整height，例如16/9的播放容器，该容器可以适配父属性flex:1下的播放容器
 *
 * @example
 * ```jsx
 * <WidthRatio bottomRatio={9 / 16}>
 *  <video />
 * </WidthRatio>
 * ```
 */
const WidthRatioHeight: FC<Props> = (props) => {
  const { width, children, bottomRatio, ..._props } = props
  return (
    <div
      {..._props}
      className={classNames('width-ratio', props.className)}
      style={{
        width,
        '--padding-bottom': `${bottomRatio * 100}%`,
        ...(props.style || {}),
      } as any}
    >
      <div className="width-ratio-padding">
        <div className="width-ratio-children-container">{children}</div>
      </div>
    </div>
  )
}

export default WidthRatioHeight
