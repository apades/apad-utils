import type { OrPromise } from '@pkgs/utils/type'
import { isFunction, isPromise } from 'radash'
import { useEffect } from 'react'

export function useOnce(
  cb: (state: {
    /** 在async中可以通过这个判断await过后的代码要不要继续执行 */
    readonly isUnmounted: boolean
  }) => OrPromise<void | (() => void)>,
): void {
  return useEffect(() => {
    let isUnmounted = false
    const state = {
      get isUnmounted() {
        return isUnmounted
      },
    }

    const onUnmount = () => {
      isUnmounted = true
    }

    const cbReturn = cb(state)
    if (isPromise(cbReturn)) {
      return onUnmount
    }

    const cbUnmount = isFunction(cbReturn) ? cbReturn : () => {}
    return () => {
      onUnmount()
      cbUnmount()
    }
  }, [])
}
