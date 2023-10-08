export const INTERSECTION = 'INTERSECTION'

export type InjectorIntersectionObserver = IntersectionObserver & {
  callback: IntersectionObserverCallback
  options: IntersectionObserverInit
}
