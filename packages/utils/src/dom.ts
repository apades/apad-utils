import type { ValueOf } from '../../tsconfig/types/global'

export const dq: {
  <K extends keyof HTMLElementTagNameMap>(
    selectors: K,
    tar?: Document | ValueOf<HTMLElementTagNameMap> | Element
  ): HTMLElementTagNameMap[K][]
  <K extends keyof SVGElementTagNameMap>(
    selectors: K,
    tar?: Document | ValueOf<SVGElementTagNameMap> | Element
  ): SVGElementTagNameMap[K][]
  <E extends Element = HTMLDivElement>(
    selectors: string,
    tar?: Document | Element
  ): E[]
} = (selector: string, tar = window.document) => {
  return Array.from(tar.querySelectorAll(selector))
}
export const dq1: {
  <K extends keyof HTMLElementTagNameMap>(
    selectors: K,
    tar?: Document | ValueOf<HTMLElementTagNameMap> | Element
  ): HTMLElementTagNameMap[K] | null
  <K extends keyof SVGElementTagNameMap>(
    selectors: K,
    tar?: Document | ValueOf<SVGElementTagNameMap> | Element
  ): SVGElementTagNameMap[K] | null
  <E extends Element = HTMLDivElement>(
    selectors: string,
    tar?: Document | Element
  ): E | null
} = (selector: string, tar = window.document) => {
  const dom = tar.querySelector(selector)
  return dom
}

export function getTopParent(el: HTMLElement) {
  let p = el
  while (true) {
    if (p.parentElement)
      p = p.parentElement
    else break
  }
  return p
}

export const dq1Parent: {
  <K extends keyof HTMLElementTagNameMap>(el: HTMLElement, selectors: K):
    | HTMLElementTagNameMap[K]
    | null
  <K extends keyof SVGElementTagNameMap>(el: HTMLElement, selectors: K):
    | SVGElementTagNameMap[K]
    | null
  <E extends Element = HTMLDivElement>(
    el: HTMLElement,
    selectors: string
  ): E | null
} = (el: HTMLElement, selectors: string) => {
  if (!el)
    return null
  let p = el
  while (true) {
    const v = p.matches(selectors)
    if (v) {
      break
    }
    else {
      if (p.parentElement) {
        p = p.parentElement
      }
      else {
        p = null
        break
      }
    }
  }

  return p
}

export const dqParents: {
  <K extends keyof HTMLElementTagNameMap>(el: HTMLElement, selectors: K):
    | HTMLElementTagNameMap[K][]
  <K extends keyof SVGElementTagNameMap>(el: HTMLElement, selectors: K):
    | SVGElementTagNameMap[K][]
  <E extends Element = HTMLDivElement>(el: HTMLElement, selectors: string): E[]
} = (el: HTMLElement, selectors: string) => {
  if (!el)
    return []
  const rs: HTMLElement[] = []
  let p = el.parentElement
  while (true) {
    const v = p.matches(selectors)
    if (v)
      rs.push(p)
    if (p.parentElement)
      p = p.parentElement
    else break
  }

  return rs
}

// TODO 测试，修改到了核心的选择功能
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
        && (p.computedStyleMap().get('position') as any).value == 'absolute'
        : false
      if (isAbHeightFull) {
        rs.push(p)
        rs.push(p.parentElement)
        p = p.parentElement.parentElement
      }
      else if (
        Math.abs(pel.clientHeight - p.clientHeight) <= offset
        && pel.clientWidth == p.clientWidth
      ) {
        rs.push(pel)
        p = p.parentElement
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

enum BackType {
  null = -1,
  false = 0,
  true = 1,
}
export function getTopParentWithCallback(
  el: HTMLElement,
  fn: (parent: HTMLElement, el: HTMLElement) => BackType,
) {
  let p = el
  while (true) {
    const pel = p.parentElement
    if (pel) {
      const rs = fn(pel, p)
      switch (rs) {
        case BackType.null: {
          p = null
          break
        }
        case BackType.true: {
          p = pel
          break
        }
      }
      p = pel
    }
    else {
      break
    }
  }
  return p
}
