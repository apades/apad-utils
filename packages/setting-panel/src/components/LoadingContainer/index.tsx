import { isFunction } from '@pkgs/utils/src/utils'
import type { VNode } from 'preact'
import type { FC } from 'preact/compat'
import './index.less'

type Props = {
  isLoading: boolean
  children: VNode | (() => VNode)
}

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
  let { isLoading, children } = props
  return (
    <div className={'loading-container setting-panel cate-type'}>
      {isLoading && <div className="loading-icon"></div>}
      {isFunction(children) ? !isLoading && children() : children}
    </div>
  )
}

export default LoadingContainer
