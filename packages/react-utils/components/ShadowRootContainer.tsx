import type { FC, PropsWithChildren } from 'react'
import React, { useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
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
      {createPortal(props.children, shadowRoot.shadowRoot!)}
    </div>
  )
}

export default ShadowRootContainer
