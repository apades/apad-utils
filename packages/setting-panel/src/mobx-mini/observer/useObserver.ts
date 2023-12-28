import { useRef, useState } from 'preact/hooks'

export function useObserver<T>(render: () => T): T {
  const [, forceUpdate] = useState<symbol>()
  const updateRef = useRef<(e: any) => void>(() => 1)

  const values = [...(globalThis as any).__obverseMap.values()]
  let listenKeys: string[] = []
  let getListen = (e: any) => {
    listenKeys.push(e.key)
  }
  values.forEach(({ eventEmitter }) => {
    eventEmitter.addListener('get', getListen)
    eventEmitter.removeListener('set', updateRef.current)
  })
  let renderResult: T = render()
  values.forEach(({ eventEmitter }) => {
    eventEmitter.removeListener('get', getListen)

    const update = (e: any) => {
      if (!listenKeys.includes(e.key)) return
      forceUpdate(Symbol())
    }
    updateRef.current = update
    eventEmitter.addListener('set', updateRef.current)
  })

  return renderResult
}
