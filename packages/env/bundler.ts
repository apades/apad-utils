// TODO 整理能用的
import path from 'path'
import dotenv from 'dotenv'
import fs from 'fs-extra'
import { merge } from 'lodash-es'

export function getEnvConf() {
  try {
    let envFile = path.resolve(__dirname, `../.env.${process.env.envFile}`)
    return dotenv.parse(fs.readFileSync(envFile, 'utf-8'))
  } catch (error) {
    try {
      let envFile = path.resolve(__dirname, `../.env.dev`)
      return dotenv.parse(fs.readFileSync(envFile, 'utf-8'))
    } catch (error) {
      return {}
    }
  }
}

// TODO 还要把所有的数据整合成json放到process.env.____env____中
export function getWebpackDefinePlugin(data: Record<any, any> = {}) {
  let env = merge(data)
  let envData = {}

  Object.entries(env).forEach(([key, val]) => {
    envData[`process.env.${key}`] = /^(\d+|true|false)$/.test(val as string)
      ? val
      : `"${val}"`
  })
  return envData
}
