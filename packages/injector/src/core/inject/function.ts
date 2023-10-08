/* eslint-disable @typescript-eslint/ban-types */

import { KeyOfType } from '@pkgs/tsconfig/types/global'
import { isArray } from '@pkgs/utils/src/utils'

export function injectFunction<
  T extends object,
  K extends KeyOfType<T, Function>
>(
  origin: T,
  keys: K[] | K,
  cb: (...args: any) => void
): {
  originKeysValue: Record<K, T[K]>
  restore: () => void
} {
  if (!isArray(keys)) keys = [keys]

  let originKeysValue = keys.reduce((obj, key) => {
    obj[key] = origin[key]
    return obj
  }, {} as Record<K, T[K]>)

  keys.map((k) => origin[k])

  keys.map((key, i) => {
    ;(origin as any)[key] = (...args: any) => {
      cb(...args)
      return (originKeysValue[key] as Function).apply(origin, args)
    }
  })

  return {
    originKeysValue,
    restore: () => {
      for (let key in originKeysValue) {
        origin[key] = (originKeysValue[key] as Function).bind(origin)
      }
    },
  }
}
