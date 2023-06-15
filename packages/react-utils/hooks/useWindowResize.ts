import { throttle } from 'lodash'
import { useOnce } from '.'

export function useWindowResize(onResize: () => void) {
  useOnce(() => {
    onResize()
    let handleResize = throttle(() => {
      onResize()
    }, 500)
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  })
}
