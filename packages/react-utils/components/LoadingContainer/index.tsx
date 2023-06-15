import classNames from 'classnames'
import { isFunction } from 'lodash'
import React, { CSSProperties, FC, ReactElement, ReactNode } from 'react'
import './index.less'

type Props = {
  isLoading: boolean
  /**默认30px */
  loadingSize?: number
  minHeight?: CSSProperties['minHeight']
  style?: CSSProperties
  children: ReactNode | (() => ReactNode)
  /**骨架屏加载动画模式 */
  skeletonMode?: boolean
} & React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>

/**
 * 显示加载中的包裹组件
 *
 * @example
 * ```jsx
 * <LoadingContainer isLoading>
 *  asdfasdf
 * </LoadingContainer>
 * ```
 */
let LoadingContainer: FC<Props> = (props) => {
  let {
    loadingSize = 30,
    isLoading,
    minHeight,
    skeletonMode,
    children,
    ..._props
  } = props
  let className = classNames(_props.className, {
    'loading-container': isLoading,
    'skeleton-mode': skeletonMode,
  })
  return (
    <div
      {..._props}
      className={className}
      style={{
        minHeight: isLoading && minHeight,
        ...(props.style || {}),
      }}
    >
      {isLoading && !props.skeletonMode && (
        <div className="loading-icon">
          {/* <LoadingOutlined style={{ fontSize: loadingSize }} /> */}
        </div>
      )}
      {isFunction(props.children)
        ? !isLoading && props.children()
        : props.children}
    </div>
  )
}

export default LoadingContainer
