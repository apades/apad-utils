import ReactDOM from 'react-dom/client'

export function render(vNode: any, parent: HTMLElement) {
  return ReactDOM.createRoot(parent).render(vNode)
}
