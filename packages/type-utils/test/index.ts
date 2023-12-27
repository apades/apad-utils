import { Omit } from '../src/utils'

type TestObj = {
  a: number
  b: string
}
type Arr = ['1', 2]

type Test2 = Omit<Arr, 3>
