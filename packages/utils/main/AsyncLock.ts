/**
 * 流程控制锁，用于控制异步流程
 *
 * @example
 * ```tsx
 * const lock = new AsyncLock()
 * settimeout(() => {
 *   lock.ok()
 * }, 1000)
 *
 * lock.waiting().then(() => {
 *   // do something
 * })
 * ```
 */
export default class AsyncLock {
  // eslint-disable-next-line ts/no-unsafe-function-type
  checkingAsyncQueue: Function[] = []
  isOk = false

  waiting = () => {
    if (this.isOk)
      return Promise.resolve()
    return new Promise((resolve) => {
      this.checkingAsyncQueue.push(resolve)
    })
  }

  ok = () => {
    this.isOk = true
    this.checkingAsyncQueue.forEach(fn => fn())
    this.checkingAsyncQueue.length = 0
  }

  reWaiting = () => {
    this.isOk = false
  }
}
