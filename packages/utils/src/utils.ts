import type { CSSProperties } from 'react'

export function getClientRect<T extends HTMLElement>(dom: T): DOMRect {
  let rect: DOMRect
  try {
    rect = dom?.getClientRects()[0]
  } catch (error) {
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

export let wait = (time = 0): Promise<void> =>
  new Promise((res) =>
    setTimeout(() => {
      res()
    }, time)
  )

export let getUrlQuery = (key: string): string => {
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
  op?:
    | Partial<T>
    | (Partial<Omit<T, 'style'>> & { style: CSSStyleDeclaration | string })
): T {
  let el = document.createElement(tag)
  Object.assign(el, op)
  return el as T
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function isPromiseFunction(fn: Function): fn is () => Promise<any> {
  return (fn as any).__proto__.constructor.toString().includes('AsyncFunction')
}
