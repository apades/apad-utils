import { onceCallWithMap } from '@pkgs/utils/main/once'
import fs from 'fs-extra'
import { resolve } from 'path'

export const getFileInParents = onceCallWithMap(
  (root: string, fileName: string, deep = 10) => {
    let index = 0
    function getFileInParent(path: string): string {
      if (index++ > deep) return null
      if (fs.readdirSync(path).includes(fileName))
        return resolve(path, fileName)
      return getFileInParent(resolve(path, '../'))
    }

    return getFileInParent(resolve(root, `./`))
  }
)
