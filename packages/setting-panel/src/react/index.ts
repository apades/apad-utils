import type React from 'react'
import type { Rec } from '../../../tsconfig/types/global'
import type { BaseMobx } from '../types'
import { forwardRef, memo } from 'react'
import { makeAutoObservable, observe } from '../mobx-mini'
import { useObserver } from './useObserver'

const hasSymbol = typeof Symbol === 'function' && Symbol.for
// Using react-is had some issues (and operates on elements, not on types), see #608 / #609
const ReactForwardRefSymbol = hasSymbol
  ? Symbol.for('react.forward_ref')
  : typeof forwardRef === 'function'
    // eslint-disable-next-line react/ensure-forward-ref-using-ref
    && forwardRef(() => null).$$typeof

export function observer<P extends object, TRef = Rec>(
  baseComponent:
    | React.ForwardRefRenderFunction<TRef, P>
    | React.FunctionComponent<P>
    | React.ForwardRefExoticComponent<
        React.PropsWithoutRef<P> & React.RefAttributes<TRef>
    >,
) {
  let render = baseComponent

  // so we can patch render and apply memo
  if (
    ReactForwardRefSymbol
    && (baseComponent as any).$$typeof === ReactForwardRefSymbol
  ) {
    render = (baseComponent as any).render
    if (typeof render !== 'function') {
      throw new TypeError(
        `[mobx-react-lite] \`render\` property of ForwardRef was not a function`,
      )
    }
  }

  let observerComponent = (props: any, ref: React.Ref<TRef>) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useObserver(() => render(props, ref))
  }

  // Inherit original name and displayName, see #3438
  ;(observerComponent as React.FunctionComponent).displayName
    = baseComponent.displayName
  Object.defineProperty(observerComponent, 'name', {
    value: baseComponent.name,
    writable: true,
    configurable: true,
  })

  // Support legacy context: `contextTypes` must be applied before `memo`
  if ((baseComponent as any).contextTypes) {
    ;(observerComponent as React.FunctionComponent).contextTypes = (
      baseComponent as any
    ).contextTypes
  }

  // memo; we are not interested in deep updates
  // in props; we assume that if deep objects are changed,
  // this is in observables, which would have been tracked anyway
  observerComponent = memo(observerComponent)

  return observerComponent
}

export const mobx = {
  makeAutoObservable,
  observe,
  observer,
} as BaseMobx

export default mobx
