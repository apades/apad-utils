import { AsyncLock } from '@pkgs/utils/src'
import { isPromiseFunction } from '@pkgs/utils/src/utils'
import { isFunction } from 'lodash'
import { useEffect } from 'react'

type ueRe = void | (() => void)
export function useOnce(cb: (() => ueRe) | (() => Promise<ueRe>)): void {
  return useEffect(() => {
    if (isPromiseFunction(cb)) {
      let lock = new AsyncLock()
      let clearFn: () => void = () => 1
      cb().then((fn) => {
        if (isFunction(fn)) clearFn = fn
        lock.ok()
      })
      return () => {
        lock.waiting().then(clearFn)
      }
    }
    return cb()
  }, [])
}
