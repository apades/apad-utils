import { merge } from 'lodash-es'
import { Rec } from '../tsconfig/types/global'

// 这是给web用的
const env = process.env.____env____

export function extendEnv(extendEnv: Rec = {}) {
  Object.assign(env, extendEnv)
}
export function getEnv() {
  const envCover = JSON.parse(localStorage['env_cover'] || '{}')
  return merge(env, envCover)
}
