declare module 'entry' {
  export function render(vNode: any, parent: HTMLElement): () => void
  export function createPortal(vNode: any, parent: any): any
  export type ReactNode = any
}
