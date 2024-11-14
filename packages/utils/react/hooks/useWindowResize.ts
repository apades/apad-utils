import { throttle } from 'radash'
import { useOnce } from '.'

export function useWindowResize(onResize: () => void) {
  useOnce(() => {
    onResize()
    const handleResize = throttle({ interval: 500 }, () => {
      onResize()
    })
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  })
}
