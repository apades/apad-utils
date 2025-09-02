import { Rec } from '@pkgs/type-utils/lib'
import { EnvData } from './type'

// 这是给web用的
const env = process.env.____env____

export function extendEnv(extendEnv: Rec = {}) {
  Object.assign(env, extendEnv)
}
export function getEnv(): EnvData {
  return {
    ...(env as any),
    ...getCoverEnv(),
  }
}

export function getCoverEnv() {
  try {
    const coverEnv = JSON.parse(localStorage['cover_env'] || '{}')
    return coverEnv
  } catch (error) {
    return {}
  }
}
