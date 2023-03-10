import { merge } from 'lodash-es'

// 这是给web用的
const env = process.env.____env____

export function getEnv() {
  const envCover = JSON.parse(localStorage['env_cover'] || '{}')
  return merge(env, envCover)
}
