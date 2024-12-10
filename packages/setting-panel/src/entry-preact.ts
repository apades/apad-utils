import { render as preactRender } from 'preact'

export function render(vNode: any, parent: HTMLElement) {
  preactRender(vNode, parent)
  return () => {
    preactRender(null, parent)
  }
}
