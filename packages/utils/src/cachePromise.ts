type noop = (this: any, ...args: any[]) => Promise<any>
type Option = Partial<{
  /** 过期时间，秒 */
  expired: number
  /** 把map挂在globalThis上，在react中可以放在hook中避免更新了创建了新闭包把旧的map丢弃了 */
  key: string
  /** 打开多spa的情况，会导致各个spa缓存不统一，启用可以页面切换时清除缓存 */
  expiredOnPageBlur: boolean
  /** 打开多spa的情况，同步各个spa的缓存 */
  asyncMultiTabMapCache: boolean
  /** 开启asyncMultiTabMapCache时传输给其他tab时转化数据，例如Proxy是没法传的需要转成纯object才行 */
  resolveData: (data: any) => any
}>
type Re<T extends noop> = T & {
  /** 强制刷新 */
  force: T
  /** 清除所有缓存 */
  clear: () => void
  map: Map<string, { date: number, fn: ReturnType<T> }>
}

const tabId = new Date().getTime()
/** 传入相同args都会记录cache */
export function cachePromise<T extends noop>(fn: T, option?: Option): Re<T> {
  let map = new Map<string, { date: number, fn: ReturnType<T> }>()
  if (option?.key) {
    ;(globalThis as any)[`cachePromise_${option?.key}`]
      = (globalThis as any)[`cachePromise_${option?.key}`] ?? new Map()
    map = (globalThis as any)[`cachePromise_${option?.key}`]
  }
  if (option?.expiredOnPageBlur) {
    window.addEventListener('blur', () => map.clear())
  }
  if (option?.asyncMultiTabMapCache) {
    const bc = new BroadcastChannel('cachePromise')
    bc.postMessage({
      tabId,
      type: 'async-request',
    })
    bc.addEventListener('message', async (e) => {
      if (e.data.tabId === tabId)
        return
      switch (e.data.type) {
        case 'async-request': {
          const dataMap = (await Promise.all(
            [...map.entries()].map(async ([key, val]) => [
              key,
              {
                date: val.date,
                fn: option?.resolveData
                  ? option?.resolveData(await val.fn)
                  : await val.fn,
              },
            ]),
          )) as [string, { date: number, fn: any }][]

          bc.postMessage({
            type: 'async-response',
            tabId,
            map: new Map(dataMap),
          })
          break
        }
        case 'async-response': {
          const newMap = e.data.map as Map<
            string,
            { date: number, fn: Awaited<ReturnType<T>> }
          >
          ;[...newMap.entries()].forEach(([key, val]) => {
            if (map.has(key))
              return
            map.set(key, {
              date: val.date,
              fn: Promise.resolve(val.fn) as any,
            })
          })
          break
        }
      }
    })
  }

  function _default(...args: Parameters<T>) {
    const key = JSON.stringify(args)
    const tar = map.get(key)
    if (
      !tar
      || (option?.expired
        && tar.date + option.expired * 1000 < new Date().getTime())
    ) {
      map.set(key, { date: new Date().getTime(), fn: fn(...args) as any })
    }

    return map.get(key).fn
  }
  _default.force = (...args: Parameters<T>) => {
    const key = JSON.stringify(args)
    map.set(key, { date: new Date().getTime(), fn: fn(...args) as any })
    return map.get(key).fn
  }
  _default.clear = () => map.clear()
  _default.map = map

  return (_default as any) as Re<T>
}
