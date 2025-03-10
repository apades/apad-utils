import ReactDOM from 'react-dom/client'

export function render(vNode: any, parent: HTMLElement) {
  const root = ReactDOM.createRoot(parent)
  root.render(vNode)
  return () => {
    root.unmount()
  }
}

export type { ReactNode } from 'react'
export { createPortal } from 'react-dom'
