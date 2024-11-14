import type { CSSProperties } from 'react'
import { tryit } from 'radash'
import { createElement } from '.'

let el: HTMLSpanElement
export function getTextWidth(text: string, style: CSSProperties): number {
  if (!el) {
    el = document.createElement('span')
    document.body.appendChild(el)
    el.style.visibility = 'hidden'
    el.style.position = 'fixed'
    el.setAttribute('desc', 'calc text overflow node')
  }

  for (const k in style) {
    el.style[k as any] = (style as any)[k]
  }
  el.textContent = text

  // console.log('el.clientWidth', el.offsetWidth, el)

  return el.clientWidth
}

export function onWindowLoad() {
  return new Promise<void>((res) => {
    if (document.readyState === 'complete')
      return res()
    const fn = () => {
      res()
      window.removeEventListener('load', fn)
    }
    window.addEventListener('load', fn)
  })
}

export function getClientRect<T extends HTMLElement>(
  dom: T,
): DOMRect | undefined {
  const [error, rect] = tryit(() => dom?.getClientRects()[0])()
  console.error(error)
  return rect
}
