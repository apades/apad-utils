import type { FC, PropsWithChildren } from 'preact/compat'
import React, { createPortal, useMemo, useRef } from 'preact/compat'
import { useOnce } from '../hooks'

const ShadowRootContainer: FC<PropsWithChildren> = (props) => {
  const rootRef = useRef<HTMLDivElement>(null)

  const shadowRoot = useMemo(() => {
    const root = document.createElement('div')
    root.attachShadow({ mode: 'open' })
    return root
  }, [])

  useOnce(() => {
    if (!rootRef.current)
      return
    rootRef.current.appendChild(shadowRoot)
  })

  return (
    <div ref={rootRef} style={{ all: 'initial' }}>
      {createPortal(props.children as any, shadowRoot.shadowRoot!)}
    </div>
  )
}

export default ShadowRootContainer
