import { useRef, useState } from 'preact/hooks'

export function useObserver<T>(render: () => T): T {
  const [, forceUpdate] = useState<symbol>()
  const updateRef = useRef<(e: any) => void>(() => 1)

  const values = [...(globalThis as any).__obverseMap.values()]
  const listenKeys: string[] = []
  const getListen = (e: any) => {
    listenKeys.push(e.key)
  }
  values.forEach(({ eventEmitter }) => {
    eventEmitter.on('get', getListen)
    eventEmitter.off('set', updateRef.current)
  })
  const renderResult: T = render()
  values.forEach(({ eventEmitter }) => {
    eventEmitter.off('get', getListen)

    const update = (e: any) => {
      if (!listenKeys.includes(e.key))
        return
      forceUpdate(Symbol(''))
    }
    updateRef.current = update
    eventEmitter.on('set', updateRef.current)
  })

  return renderResult
}
