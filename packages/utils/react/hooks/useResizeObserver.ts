import { debounce } from 'radash'
import { useCallback, useEffect, useRef } from 'react'

export function useResizeObserver<T extends HTMLElement = HTMLDivElement>(
  onResize: (width: number, height: number) => void,
): {
    domRef: React.MutableRefObject<T>
    forceCall: () => void
  } {
  const domRef = useRef<T>(null)
  const _onResize = useCallback(
    debounce({ delay: 1000 }, () => {
      onResize(domRef.current?.clientWidth, domRef.current?.clientHeight)
    }),
    [],
  )

  const observer = useRef<ResizeObserver>(new ResizeObserver(_onResize))

  useEffect(() => {
    if (!domRef.current)
      return
    _onResize()

    observer.current.observe(domRef.current)
    return () => {
      observer.current.disconnect()
    }
  }, [domRef.current])

  return { domRef, forceCall: _onResize }
}
