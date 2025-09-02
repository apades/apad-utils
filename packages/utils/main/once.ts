import { isEqual } from 'lodash-es'
import { isPromiseFunction, tryCatch } from '../src/utils'
import type { Noop } from '../type'

/**onceCall变种，会记住所有传的args，所有args的地址/简单数据相同返回的数据都是相同的 */
export function onceCallWithMap<T extends Noop>(
  fn: T
): T & { clear: () => void } {
  let rootMap = new WeakMap()
  let unObjMap = new Map()
  const noArgsSymbol = Symbol()
  const getKey = (key: any) => {
    if (key instanceof Object) return key
    if (!unObjMap.has(key)) unObjMap.set(key, Symbol())
    return unObjMap.get(key)
  }

  const getMapRs = (keys: any[], map: WeakMap<any, any>): any => {
    const key = getKey(keys.shift())
    if (!map.has(key)) throw Error()
    const val = map.get(key)
    if (val instanceof WeakMap) return getMapRs(keys, val)
    return val
  }
  const setMapRs = (keys: any[], map: WeakMap<any, any>, rs: any): void => {
    const key = getKey(keys.shift())
    if (!map.has(key)) {
      if (keys.length) {
        const newMap = new WeakMap()
        map.set(key, newMap)
        return setMapRs(keys, newMap, rs)
      } else {
        map.set(key, rs)
      }
    }
  }

  function re(...args: any[]) {
    try {
      if (!args.length) return getMapRs([noArgsSymbol], rootMap)
      const rs = getMapRs([...args], rootMap)
      return rs
    } catch (error) {
      const rs = fn(...args)
      if (!args.length) setMapRs([noArgsSymbol], rootMap, rs)
      else setMapRs([...args], rootMap, rs)
      return rs
    }
  }
  re.clear = () => {
    rootMap = new WeakMap()
    unObjMap = new Map()
  }

  return re as T & { clear: () => void }
}

export function onceCall<T extends Noop>(fn: T): T {
  if (isPromiseFunction(fn)) return oncePromise(fn)
  let rs: any
  let lastArgs: any
  let hasCall = false
  let err: any = null

  return ((...args: any[]) => {
    if (!hasCall || !isEqual(args, lastArgs) || err) {
      hasCall = true
      ;[err, rs] = tryCatch(() => (fn as (...args: any[]) => {})(...args))
    }
    lastArgs = args
    return rs as ReturnType<typeof fn>
  }) as T
}

/**包住async函数，让它只会运行一次，之后再调用函数返回的还是第一次运行结果，不会再调用函数 */
export function oncePromise<T extends Noop>(fn: T): T {
  let promise: Promise<any>
  let lastArgs: any
  let isErr = false

  return ((...args: any[]) => {
    if (!promise || !isEqual(args, lastArgs) || isErr) {
      promise = new Promise((res, rej) => {
        fn(...args)
          .then((e: any) => {
            res(e)
            isErr = false
          })
          .catch((e: any) => {
            rej(e)
            isErr = true
          })
      })
    }
    lastArgs = args
    return promise
  }) as T
}
