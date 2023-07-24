// TODO 整理能用的
import path from 'path'
import dotenv from 'dotenv'
import fs from 'fs-extra'
import { merge } from 'lodash-es'
import { getFileInParents } from './utils'
import { Rec } from '@pkgs/tsconfig/types/global'

export function getEnvConf(type?: string) {
  let selfEnvFile = getFileInParents('.env'),
    tarEnvFile = ''
  if (type) {
    tarEnvFile = getFileInParents(`.env.${type}`)
  }

  let selfEnv = selfEnvFile
      ? dotenv.parse(fs.readFileSync(selfEnvFile, 'utf-8'))
      : {},
    tarEnv = tarEnvFile
      ? dotenv.parse(fs.readFileSync(tarEnvFile, 'utf-8'))
      : {}

  return merge(tarEnv, selfEnv)
}

export function getDefinesObject(type?: string, coverData?: Rec) {
  let env = merge(getEnvConf(type), coverData ?? {})
  let envData: Rec = {}

  Object.entries(env).forEach(([key, val]) => {
    envData[`process.env.${key}`] = /^(\d+|true|false)$/.test(val as string)
      ? val
      : `"${val}"`
  })
  envData[`process.env.____env____`] = JSON.stringify(env)
  envData['process.env'] = '({})'

  return envData
}
