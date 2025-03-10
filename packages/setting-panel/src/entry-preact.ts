import { render as preactRender } from 'preact'

export function render(vNode: any, parent: HTMLElement) {
  preactRender(vNode, parent)
  return () => {
    preactRender(null, parent)
  }
}
export type { VNode as ReactNode } from 'preact'
export { createPortal } from 'preact/compat'
