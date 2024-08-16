import React, { useRef } from 'react'

export function useObserver<T>(render: () => T): T {
  const [, forceUpdate] = React.useState<symbol>()
  const updateRef = useRef<(e: any) => void>(() => 1)

  const values = [...(globalThis as any).__obverseMap.values()]
  let listenKeys: string[] = []
  let getListen = (e: any) => {
    listenKeys.push(e.key)
  }
  values.forEach(({ eventEmitter }) => {
    eventEmitter.on('get', getListen)
    eventEmitter.off('set', updateRef.current)
  })
  let renderResult: T = render()
  values.forEach(({ eventEmitter }) => {
    eventEmitter.off('get', getListen)

    const update = (e: any) => {
      if (!listenKeys.includes(e.key)) return
      forceUpdate(Symbol())
    }
    updateRef.current = update
    eventEmitter.on('set', updateRef.current)
  })

  return renderResult
}
