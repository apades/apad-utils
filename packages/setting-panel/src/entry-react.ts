import ReactDOM from 'react-dom/client'

export function render(vNode: any, parent: HTMLElement) {
  const root = ReactDOM.createRoot(parent)
  root.render(vNode)
  return root.unmount
}
