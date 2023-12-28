/**
 * 相比起/src/react/index.ts的少了forwardRef, memo功能，且都用preact
 */
import { useObserver } from './useObserver'
import type { Rec } from '@pkgs/tsconfig/types/global'
import type React from 'react'

export function observer<P extends object, TRef = Rec>(
  baseComponent:
    | React.ForwardRefRenderFunction<TRef, P>
    | React.FunctionComponent<P>
    | React.ForwardRefExoticComponent<
        React.PropsWithoutRef<P> & React.RefAttributes<TRef>
      >
) {
  let render = baseComponent

  let observerComponent = (props: any, ref: React.Ref<TRef>) => {
    return useObserver(() => render(props, ref))
  }

  ;(observerComponent as React.FunctionComponent).displayName =
    baseComponent.displayName
  Object.defineProperty(observerComponent, 'name', {
    value: baseComponent.name,
    writable: true,
    configurable: true,
  })

  return observerComponent
}
