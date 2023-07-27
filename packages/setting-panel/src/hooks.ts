import AsyncLock from '@pkgs/utils/src/AsyncLock'
import { isFunction, isPromiseFunction } from '@pkgs/utils/src/utils'
import { useEffect, useMemo, useRef } from 'preact/hooks'
import { noop } from '../../tsconfig/types/global'

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

type PickFunction<T extends noop> = (
  this: ThisParameterType<T>,
  ...args: Parameters<T>
) => ReturnType<T>

export function useMemoizedFn<T extends noop>(fn: T) {
  const fnRef = useRef<T>(fn)

  // why not write `fnRef.current = fn`?
  // https://github.com/alibaba/hooks/issues/728
  fnRef.current = useMemo(() => fn, [fn])

  const memoizedFn = useRef<PickFunction<T>>()
  if (!memoizedFn.current) {
    memoizedFn.current = function (this, ...args) {
      return fnRef.current.apply(this, args)
    }
  }

  return memoizedFn.current as T
}
