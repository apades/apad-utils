import type { CSSProperties } from 'react'
import path from 'node:path'

export function getMixinLessPath() {
  return path.resolve(__dirname, './mixin.less')
}

export function getClientRect<T extends HTMLElement>(dom: T): DOMRect {
  let rect: DOMRect
  try {
    rect = dom?.getClientRects()[0]
  }
  catch (error) {
    console.error('some error', error)
  }
  return rect
}

export function style(style: Record<string, any> & CSSProperties) {
  return style
}
