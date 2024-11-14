import type { ValueOf } from '../type'
import { tryit } from 'radash'

/**
 * 获取父element版的querySelector
 */
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
        p = null!
        break
      }
    }
  }

  return p
}

/**
 * 获取父element版的querySelectorAll
 */
export const dqParents: {
  <K extends keyof HTMLElementTagNameMap>(el: HTMLElement, selectors: K):
      | HTMLElementTagNameMap[K][]
  <K extends keyof SVGElementTagNameMap>(el: HTMLElement, selectors: K):
      | SVGElementTagNameMap[K][]
  <E extends Element = HTMLDivElement>(el: HTMLElement, selectors: string): E[]
} = (el: HTMLElement, selectors: string) => {
  if (!el || !el.parentElement)
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

type DqTarType =
  | Document
  | ValueOf<HTMLElementTagNameMap>
  | Element
  | undefined
  | null
/**
 * 相当于querySelectorAll，但第二参数可以指定dom | window
 */
export const dq: {
  <K extends keyof HTMLElementTagNameMap>(
    selectors: K,
    tar?: DqTarType
  ): HTMLElementTagNameMap[K][]
  <K extends keyof SVGElementTagNameMap>(
    selectors: K,
    tar?: DqTarType
  ): SVGElementTagNameMap[K][]
  <K extends keyof MathMLElementTagNameMap>(
    selectors: K,
    tar?: DqTarType
  ): MathMLElementTagNameMap[K][]
  <E extends Element = HTMLDivElement>(selectors: string, tar?: DqTarType): E[]
} = (selector: string, tar = window.document as DqTarType) => {
  return Array.from(tar?.querySelectorAll(selector) ?? [])
}

/**
 * 相当于querySelector，但第二参数可以指定dom | window
 */
export const dq1: {
  <K extends keyof HTMLElementTagNameMap>(selectors: K, tar?: DqTarType):
    | HTMLElementTagNameMap[K]
    | undefined
  <K extends keyof SVGElementTagNameMap>(selectors: K, tar?: DqTarType):
    | SVGElementTagNameMap[K]
    | undefined
  <E extends Element = HTMLDivElement>(selectors: string, tar?: DqTarType):
    | E
    | undefined
} = (selector: string, tar = window.document as DqTarType) => {
  const dom = tar?.querySelector(selector) || undefined
  return dom
}

/** 相当于querySelector，但包含从iframe内部查找 */
export const dq1Adv: typeof dq1 = (
  selector: string,
  tar = window.document as DqTarType,
) => {
  const top = dq1(selector, tar)
  if (top) {
    return top
  }
  for (const iframe of dq('iframe')) {
    const [_, child] = tryit(() => iframe.contentWindow?.document.querySelector(selector))()
    if (child)
      return child as HTMLElement
  }
}
