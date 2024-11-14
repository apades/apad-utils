/* eslint-disable ts/no-unsafe-function-type */
import type { Noop, Rec } from '../type'

/**
 * 用来统一管理对象的事件监听方法，返回的函数可以用来移除所有事件监听
 */
export function addTargetEventListener<
  CustomKey extends {
    addEventListener: keyof T
    removeEventListener: keyof T
  },
  T = {
    [customKey in keyof CustomKey]: (
      k: string,
      fn: Noop,
      ...more: any[]
    ) => void
  },
>(
  target: T,
  fn: (target: T) => void,
  /** 可以自定义addEventListener removeEventListener对应哪个方法，用来兼容mitt这类的 */
  opt?: CustomKey,
): () => void {
  const _tar = target as any
  const addEventListenerKey = opt ? opt.addEventListener : 'addEventListener'
  const removeEventListenerKey = opt ? opt.removeEventListener : 'removeEventListener'

  const originAddEventListener = opt
    ? _tar[opt.addEventListener]
    : _tar.addEventListener

  if (!originAddEventListener)
    throw new Error('addEventListener is not a function, do you forget to pass opt to redirect addEventListener key?')

  const fnMap: Rec<(Function | { fn: Function, more: any[] })[]> = {}
  _tar[addEventListenerKey] = (key: string, fn: Noop, ...more: any[]) => {
    fnMap[key] = fnMap[key] ?? []
    if (more.length) {
      fnMap[key].push({ fn, more })
    }
    else {
      fnMap[key].push(fn)
    }
    originAddEventListener.call(target, key, fn, ...more)
  }
  fn(target)
  _tar[addEventListenerKey] = originAddEventListener

  return () => {
    Object.entries(fnMap).forEach(([key, fns]) => {
      fns.forEach((fn) => {
        if (typeof fn == 'function')
          _tar[removeEventListenerKey].call(target, key, fn as any)
        else
          _tar[removeEventListenerKey].call(target, key, fn.fn as any, ...fn.more)
      })
    })
  }
}
