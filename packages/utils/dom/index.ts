import type { TransStringValToAny } from '../type'
import { isNil } from 'lodash'
import { isNumber, isObject } from 'radash'

/**
 * 获取最顶上的父element
 */
export function getTopParent(el: HTMLElement) {
  let p = el
  while (true) {
    if (p.parentElement)
      p = p.parentElement
    else break
  }
  return p
}

/**
 * 获取最顶上的父element，且父element的宽高与子元素相同
 */
export function getTopParentsWithSameRect(
  el: HTMLElement,
  /** 例如video,img标签会出现自身高度略小于容器高度 */
  offset = 3,
  /** 如果有一个absolute+h-full挂在relative下，可能会使relative的height为0 */
  skipHeight0 = true,
) {
  const rs: HTMLElement[] = []
  let p = el
  while (true) {
    const pel = p.parentElement
    if (pel) {
      const isAbHeightFull = skipHeight0
        ? !pel.clientHeight
        && (p.computedStyleMap()?.get?.('position') as any)?.value === 'absolute'
        : false
      if (isAbHeightFull) {
        rs.push(p)
        rs.push(pel)
        p = pel.parentElement!
      }
      else if (
        Math.abs(pel.clientHeight - p.clientHeight) <= offset
        && pel.clientWidth === p.clientWidth
      ) {
        rs.push(pel)
        p = pel
      }
      else {
        break
      }
    }
    else {
      break
    }
  }
  return rs
}

export function hasParent(el: HTMLElement, parent: HTMLElement) {
  let p = el.parentElement
  while (true) {
    if (!p)
      return false
    if (p === parent) {
      return true
    }
    p = p.parentElement
  }
}

export function createElement<
  T extends HTMLElement,
  TAG extends keyof HTMLElementTagNameMap,
>(
  tag: TAG,
  option?: Partial<Omit<T, 'style' | 'dataset' | 'children'>> & {
    /** 支持传入number，自动转化成px */
    style?: Partial<TransStringValToAny<CSSStyleDeclaration>> | string
    /** 不支持驼峰写法，请传`a-bc`这样，但取的时候是dataset['aBc'] */
    dataset?: Record<string, string | number>
    /** 传入子DOM */
    children?: HTMLElement[]
    [k: string]: any
  },
): HTMLElementTagNameMap[typeof tag] {
  const { children, dataset, style, ...op } = { ...option }
  const el = document.createElement(tag)
  Object.assign(el, op)
  if (style) {
    if (isObject(style)) {
      Object.entries(style).forEach(([k, v]) => {
        if (isNumber(v)) {
          v = `${v}px`
        }
        if (isNil(v))
          return
        el.style[k as any] = v as any
      })
    }
    else {
      el.style.cssText = style
    }
  }
  if (dataset) {
    Object.entries(dataset).forEach(([key, val]) => {
      el.setAttribute(`data-${key}`, `${val}`)
    })
  }
  if (children) {
    children.forEach((c) => {
      el.appendChild(c)
    })
  }
  return el
}

export * from './selector'
