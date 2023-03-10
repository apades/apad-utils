import { isNumber, isNull, isObject } from 'lodash-es'

type WaitLoop = {
  (cb: () => boolean /* | Promise<boolean> */, limitTime?: number): Promise<
    boolean
  >
  // TODO
  (
    cb: () => boolean /* | Promise<boolean> */,
    option?: Partial<{
      intervalTime: number
      intervalCount: number
      limitTime: number
    }>
  ): Promise<boolean>
}
export let loopCallbackUntilTrue: WaitLoop = (cb, option) => {
  return new Promise(async (res, rej) => {
    let intervalTime = 500,
      limitTime = option ?? 5000,
      // TODO intervalCount
      intervalCount = 10
    if (isObject(option)) {
      intervalTime = option.intervalTime ?? intervalTime
      limitTime = option.limitTime ?? limitTime
    }

    let timer: NodeJS.Timeout
    const initTime = new Date().getTime()
    const loop = () => {
      const rs = cb()
      if (!rs) {
        if (!isNull(option) && new Date().getTime() - initTime > limitTime)
          return res(false)
        return (timer = setTimeout(() => {
          loop()
        }, intervalTime))
      } else return res(true)
    }
    loop()
  })
}
