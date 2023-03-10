import fs from 'fs-extra'
import { resolve } from 'path'

export function getFileInParents(fileName: string, deep = 5) {
  let index = 0
  function getFileInParent(path: string) {
    if (index++ > deep) return null
    if (fs.readdirSync(path).includes(fileName)) return resolve(path, fileName)
    return getFileInParent(resolve(path, '../'))
  }

  return getFileInParent(resolve(__dirname, `../`))
}
