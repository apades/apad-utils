import { isFunction } from '@pkgs/utils/src/utils'
import type { CSSProperties, FC } from 'preact/compat'
import './index.less'
import type { VNode } from 'preact'

type Props = {
  isLoading: boolean
  /**默认30px */
  loadingSize?: number
  minHeight?: CSSProperties['minHeight']
  style?: CSSProperties
  children: VNode | (() => VNode)
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
  return (
    <div
      {..._props}
      className={`${_props.className} ${isLoading && 'loading-container'} ${
        skeletonMode && 'skeleton-mode'
      }`}
      style={{
        minHeight: isLoading && minHeight,
        ...(props.style || {}),
      }}
    >
      {isLoading && !props.skeletonMode && (
        <div className="loading-icon">
          <span
            role="img"
            aria-label="loading"
            className="loading-icon-default-icon"
            style={{ fontSize: loadingSize }}
          >
            <svg
              viewBox="0 0 1024 1024"
              focusable="false"
              data-icon="loading"
              width="1em"
              height="1em"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M988 548c-19.9 0-36-16.1-36-36 0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 00-94.3-139.9 437.71 437.71 0 00-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3.1 19.9-16 36-35.9 36z"></path>
            </svg>
          </span>
        </div>
      )}
      {isFunction(props.children)
        ? !isLoading && props.children()
        : props.children}
    </div>
  )
}

export default LoadingContainer
