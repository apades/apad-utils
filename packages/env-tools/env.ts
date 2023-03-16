import merge from 'lodash/merge'
import { Rec } from '../tsconfig/types/global'

// 这是给web用的
const env = process.env.____env____

export function extendEnv(extendEnv: Rec = {}) {
  Object.assign(env, extendEnv)
}
export function getEnv() {
  return merge(env, getCoverEnv())
}

export function getCoverEnv() {
  try {
    const coverEnv = JSON.parse(localStorage['cover_env'] || '{}')
    return coverEnv
  } catch (error) {
    return {}
  }
}
