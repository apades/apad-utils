import React from 'react'
import { useOnce } from '../hooks'

// TODO 查看组件render读了多少key，后续只监听这些key
export function useObserver<T>(render: () => T): T {
  const [, forceUpdate] = React.useState<symbol>()

  useOnce(() => {
    // forceUpdate(Symbol())
    const listener = () => {
      forceUpdate(Symbol())
    }
    const values = [...(globalThis as any).__obverseMap.values()]
    values.forEach(({ eventEmitter }: any) => {
      eventEmitter.addListener('set', listener)
    })

    return () => {
      values.forEach(({ eventEmitter }: any) => {
        eventEmitter.removeListener('set', listener)
      })
    }
  })
  let renderResult: T = render()

  return renderResult
}
