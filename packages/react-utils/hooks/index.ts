import { isPromiseFunction } from '@pkgs/utils/src/utils'
import { useEffect } from 'react'

export function useOnce(cb: () => void): void {
  return useEffect(() => {
    if (isPromiseFunction(cb)) {
      cb()
      return
    }

    return cb()
  }, [])
}
