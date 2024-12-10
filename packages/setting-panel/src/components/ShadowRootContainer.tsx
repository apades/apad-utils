import type { FC, PropsWithChildren } from 'preact/compat'
import { createPortal } from 'entry'
import { useMemo, useRef } from 'preact/hooks'
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
      {createPortal(props.children, shadowRoot.shadowRoot)}
    </div>
  )
}

export default ShadowRootContainer
