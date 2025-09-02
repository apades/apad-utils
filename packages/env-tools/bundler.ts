import dotenv from 'dotenv'
import fs from 'fs-extra'
import { getFileInParents } from './utils'
import { Rec } from '@pkgs/tsconfig/types/global'
import path from 'path'
import { isBoolean } from '@pkgs/utils/src/utils'

function getEnvConfsPath(padEnd?: string, root = process.cwd()) {
  let selfEnvFile = getFileInParents(root, '.env'),
    tarEnvFile = ''
  if (padEnd) {
    tarEnvFile = getFileInParents(root, `.env.${padEnd}`)
  }

  return {
    selfEnvFile,
    tarEnvFile,
  }
}

export function getEnvConf(padEnd?: string, root = process.cwd()) {
  const { selfEnvFile, tarEnvFile } = getEnvConfsPath(padEnd, root)

  const selfEnv = selfEnvFile
      ? dotenv.parse(fs.readFileSync(selfEnvFile, 'utf-8'))
      : {},
    tarEnv = tarEnvFile
      ? dotenv.parse(fs.readFileSync(tarEnvFile, 'utf-8'))
      : {}

  return {
    ...tarEnv,
    ...selfEnv,
  }
}

/**
 * default `.env` file, output env data with all key start with `process.env.`
 *
 * @param padEnd if set `dev`, will to get `.env.dev` file
 */
export function getDefinesObject(
  padEnd?: string,
  options?: Partial<{
    /**default `process.pwd()` */
    root: string
    /** default `true`, output file `env.d.ts` */
    dts: string | boolean
    /**cover env data */
    coverData?: Rec
  }>
) {
  const env = {
    ...getEnvConf(padEnd, options?.root),
    ...(options?.coverData ?? {}),
  }

  const dts = options?.dts ?? true
  const dtsNameDefault = 'env.d.ts'
  let dtsName =
    isBoolean(options?.dts) && options?.dts
      ? dtsNameDefault
      : (options?.dts as string) ?? dtsNameDefault
  if (!dtsName.endsWith('.d.ts')) {
    dtsName += '.d.ts'
  }

  const envData: Rec = {}
  const parserEnv: Rec<{ val: any; type: 'string' | 'boolean' | 'number' }> = {}

  Object.entries(env).forEach(([key, val]) => {
    let isOrigin = false
    if (/^(\d+)$/.test(val) && val.length <= 16) {
      isOrigin = true
      parserEnv[key] = {
        val: Number(val),
        type: 'number',
      }
    }
    if (/^(true|false)$/.test(val)) {
      isOrigin = true
      parserEnv[key] = {
        val: val === 'true',
        type: 'boolean',
      }
    }

    envData[`process.env.${key}`] = isOrigin ? val : `"${val}"`
    if (!isOrigin) {
      parserEnv[key] = {
        val: val,
        type: 'string',
      }
    }
  })
  envData[`process.env.____env____`] = JSON.stringify(
    Object.fromEntries(
      Object.entries(parserEnv).map(([key, { val }]) => [key, val])
    )
  )
  envData['process.env'] = '({})'

  if (dts) {
    const { selfEnvFile, tarEnvFile } = getEnvConfsPath(padEnd, options?.root)
    if (!selfEnvFile && !tarEnvFile) return
    const dtsDir = path.resolve(selfEnvFile || tarEnvFile, '../')
    let dtsContent = `import '@apad/env-tools'\n`
    dtsContent += `declare module '@apad/env-tools' {\n`
    dtsContent += ` export interface Env {\n`
    Object.entries(parserEnv).forEach(([key, { val, type }]) => {
      dtsContent += `  ${key}: ${type};\n`
    })
    dtsContent += ` }\n`
    dtsContent += `}\n`

    const basePath = ['./src/types', './src', './types', './']
    for (const bpath of basePath) {
      const p = path.resolve(dtsDir, bpath)
      if (fs.existsSync(p)) {
        fs.outputFileSync(path.resolve(p, dtsName), dtsContent)
        break
      }
    }
  }

  return envData
}

export default getDefinesObject
