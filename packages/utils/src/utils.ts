import type { CSSProperties } from 'react'
import type { noop } from '../../tsconfig/types/global'

export function getClientRect<T extends HTMLElement>(dom: T): DOMRect {
  let rect: DOMRect
  try {
    rect = dom?.getClientRects()[0]
  }
  catch (error) {
    console.error(error)
  }
  return rect
}

export function style(style: Record<string, any> & CSSProperties) {
  return style
}

export function onWindowLoad() {
  return new Promise((res) => {
    window.addEventListener('load', res)
  })
}

export function wait(time = 0): Promise<void> {
  return new Promise(res =>
    setTimeout(() => {
      res()
    }, time),
  )
}

export function getUrlQuery(key: string): string {
  return new URLSearchParams(location.search).get(key) || ''
}

export function copyText(text: string): void {
  const el = document.createElement('textarea')
  el.value = text
  el.style.position = 'absolute'
  el.style.top = '-999999px'
  document.body.appendChild(el)
  el.select()
  document.execCommand('copy')
  document.body.removeChild(el)
}

export function createElement<T extends HTMLElement>(
  tag: keyof HTMLElementTagNameMap,
  op?: // | Partial<T>
    Partial<Omit<T, 'style'>> & {
      style?: CSSStyleDeclaration | string
      [k: string]: any
    },
): T {
  const el = document.createElement(tag)
  Object.assign(el, op)
  return el as T
}

export function isPromiseFunction(fn: Function): fn is () => Promise<any> {
  return (fn as any).__proto__.constructor.toString().includes('AsyncFunction')
}

export const isBoolean = (v: any): v is boolean => typeof v === 'boolean'
export const isUndefined = (v: any): v is undefined => typeof v === 'undefined'
export const isString = (v: any): v is string => typeof v === 'string'
export function isFunction(v: any): v is (...args: any[]) => any {
  return typeof v === 'function'
}
export const isNumber = (val: any): val is number => typeof val == 'number'
export const isNull = (val: any): val is null => val == null
export const isArray = (val: any): val is Array<any> => Array.isArray(val)
export const isObject = (val: any): val is object => typeof val == 'object'
export function isNone(val: any): val is null | undefined {
  return isNull(val) || isUndefined(val)
}

export function debounce<T extends noop>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout
  return function (...args: Parameters<T>) {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      func.apply(this, args)
    }, wait)
  } as T
}

export function isEqual(obj1: any, obj2: any): boolean {
  // 如果两个对象的引用相同，则它们是相等的
  if (obj1 === obj2) {
    return true
  }

  // 如果两个对象的类型不同，则它们不相等
  if (typeof obj1 !== typeof obj2) {
    return false
  }

  // 如果两个对象都是 null，则它们是相等的
  if (obj1 === null && obj2 === null) {
    return true
  }

  // 如果两个对象都是基本类型，则比较它们的值
  if (typeof obj1 !== 'object' && typeof obj2 !== 'object') {
    return obj1 === obj2
  }

  // 如果两个对象都是数组，则比较它们的每个元素
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) {
      return false
    }
    for (let i = 0; i < obj1.length; i++) {
      if (!isEqual(obj1[i], obj2[i])) {
        return false
      }
    }
    return true
  }

  // 如果两个对象都是对象，则比较它们的每个属性
  if (typeof obj1 === 'object' && typeof obj2 === 'object') {
    const keys1 = Object.keys(obj1)
    const keys2 = Object.keys(obj2)
    if (keys1.length !== keys2.length) {
      return false
    }
    for (const key of keys1) {
      if (!isEqual(obj1[key], obj2[key])) {
        return false
      }
    }
    return true
  }

  // 如果两个对象都不是基本类型、数组或对象，则它们不相等
  return false
}

export function cloneDeep<T>(obj: T): T {
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }

  const result: any = Array.isArray(obj) ? [] : {}

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      result[key] = cloneDeep(obj[key])
    }
  }

  return result
}

export function classNames(...args: any[]) {
  return args.filter(a => !!a).join(' ')
}

export function omit<T, K extends keyof T>(obj: T, key: K[]): Omit<T, K> {
  const rs = { ...obj }
  key.forEach(k => delete rs[k])
  return rs
}

export function getDeepGetter<T, K extends keyof T>(
  tar: T,
  key: K,
): (() => any) | null {
  const getter = Object.getOwnPropertyDescriptor(tar, key)?.get
  return (
    getter
    ?? (isUndefined(Object.getPrototypeOf(tar))
      ? null
      : getDeepGetter(Object.getPrototypeOf(tar), key))
  )
}

export function arrayInsert<T>(tarr: T[], index: number, arr: T[]): T[] {
  const _tarr = [...tarr]
  const left = _tarr.splice(0, index)
  const right = _tarr

  return [...left, ...arr, ...right]
}

export function tryCatch<Return>(
  fn: () => Return,
): Return extends Promise<any>
    ? Promise<[undefined, Awaited<Return>] | [Error, undefined]>
    : [undefined, Return] | [Error, undefined] {
  try {
    const rs: any = fn()
    if (rs instanceof Promise) {
      return rs
        .then(d => [undefined, d])
        .catch(err => [err, undefined]) as any
    }
    else {
      return [undefined, rs] as any
    }
  }
  catch (error) {
    return [error as Error, undefined] as any
  }
}
