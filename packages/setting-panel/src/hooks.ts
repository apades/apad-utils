import type { noop } from '@pkgs/tsconfig/types/global'
import { AsyncLock } from '@pkgs/utils/main'
import { isFunction, isPromiseFunction } from '@pkgs/utils/src/utils'
import { useEffect, useMemo, useRef, useState } from 'preact/hooks'

type ueRe = void | (() => void)
export function useOnce(cb: (() => ueRe) | (() => Promise<ueRe>)): void {
  return useEffect(() => {
    if (isPromiseFunction(cb)) {
      const lock = new AsyncLock()
      let clearFn: () => void = () => 1
      cb().then((fn) => {
        if (isFunction(fn))
          clearFn = fn
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

export function useUpdate() {
  const [, forceUpdate] = useState(Symbol(''))
  return () => {
    forceUpdate(Symbol(''))
  }
}
