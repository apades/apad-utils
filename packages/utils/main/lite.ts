import type { AsyncFn, Noop } from '../type'
import { isEqual } from 'radash'

/**
 * 返回格式 `hh:mm:ss`
 */
export function formatTime(time: number, hasMs?: boolean): string {
  let min = ~~(time / 60)
  const sec = ~~(time % 60)
  const hours = ~~(min / 60)
  if (min >= 60)
    min = ~~(min % 60)

  const sh = hours ? `${hours}:` : ''
  const sm = `${hours ? (`${min}`).padStart(2, '0') : `${min}`}:`
  const ss = (`${sec}`).padStart(2, '0')
  const ms = hasMs
    ? `.${(`${+Math.abs(~~time - time).toFixed(1) * 10}`)[0] || '0'}`
    : ''
  return sh + sm + ss + ms
}

// eslint-disable-next-line ts/no-unsafe-function-type
export function isAsyncFunction(fn: Function): boolean {
  return (
    // eslint-disable-next-line no-proto, no-restricted-properties
    (fn as any)?.__proto__?.constructor
    === 'function AsyncFunction() { [native code] }'
  )
}

export async function wait(time = 0) {
  return new Promise<void>(res => setTimeout(res, time))
}

export function onceCall<T extends Noop>(fn: T): T {
  if (isAsyncFunction(fn))
    return oncePromise(fn)
  let rs: ReturnType<typeof fn>
  let lastArgs: any
  let hasCall = false

  return ((...args: any[]) => {
    if (!hasCall || !isEqual(args, lastArgs)) {
      hasCall = true
      rs = fn(...args)
    }
    lastArgs = args
    return rs
  }) as T
}

/** 包住async函数，让它只会运行一次，之后再调用函数返回的还是第一次运行结果，不会再调用函数 */
export function oncePromise<T extends Noop>(fn: T): T {
  let promise: Promise<any>
  let lastArgs: any

  return ((...args: any[]) => {
    if (!promise || !isEqual(args, lastArgs)) {
      promise = new Promise((res, rej) => {
        fn(...args)
          .then(res)
          .catch(rej)
      })
    }
    lastArgs = args
    return promise
  }) as T
}

export function getDeepPrototype<T = any>(from: any, equal: T): T {
  const root = Object.getPrototypeOf(from)
  if (root.constructor === equal)
    return from
  return getDeepPrototype(root, equal)
}
export function ownerWindow(node: Node | null | undefined): Window {
  const doc = ownerDocument(node)
  return doc.defaultView || window
}
export function ownerDocument(node: Node | null | undefined): Document {
  return (node && node.ownerDocument) || document
}
export function getPrototypeSetter<T>(obj: T, key: keyof T) {
  const setter = Object.getOwnPropertyDescriptor(obj, key)?.set

  if (!setter) {
    const prototype = Object.getPrototypeOf(obj)
    if (!prototype) {
      return null
    }
    return getPrototypeSetter(prototype, key)
  }

  return setter
}

export function getPrototypeGetter<T>(obj: T, key: keyof T) {
  const getter = Object.getOwnPropertyDescriptor(obj, key)?.get

  if (!getter) {
    const prototype = Object.getPrototypeOf(obj)
    if (!prototype) {
      return null
    }
    return getPrototypeGetter(prototype, key)
  }

  return getter
}

/** 多次请求时，如果上一个还没结束，这次的promise会覆盖上一个的promise请求 */
export function switchLatest<Args extends readonly unknown[], Return>(
  asyncFn: AsyncFn<Args, Return>,
) {
  let lastKey: symbol
  return async function (...args: Args): Promise<Return> {
    return new Promise((res, rej) => {
      const key = (lastKey = Symbol(''))
      asyncFn(...args).then(
        data => lastKey === key && res(data),
        err => lastKey === key && rej(err),
      )
    })
  }
}
