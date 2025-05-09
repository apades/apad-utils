/* eslint-disable unused-imports/no-unused-vars */
import type { Omit } from '../src/utils'

interface TestObj {
  a: number
  b: string
}
type Arr = ['1', 2]

type Test2 = Omit<Arr, 3>
