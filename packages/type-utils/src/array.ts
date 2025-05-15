import type { TupleToUnion } from './union'

// eslint-disable-next-line ts/no-namespace
export namespace Array {
/**
 * reverse array
 * @example
 * ```ts
 * type Test = ['1', '2']
 * type Test2 = Reverse<Test> // expected ['2', '1']
 * ```
 */
  export type Reverse<T extends unknown[]> = T extends [infer F, ...infer R]
    ? [...Reverse<R>, F]
    : []

  /**
   * get array fist value
   * @example
   * ```ts
   * type arr = ['a', 'b', 'c']
   * type v = First<arr1> // expected 'a'
   * ```
   */
  export type First<T extends any[]> = T[0]

  /**
   * get array last value
   * @example
   * ```ts
   * type arr = ['a', 'b', 'c']
   * type v = Last<arr1> // expected 'c'
   * ```
   */
  export type Last<T extends any[]> = [any, ...T][T['length']]

  /**
   * concat array
   * @example
   * ```ts
   * type Result = Concat<[1], [2]> // expected [1, 2]
   * ```
   */
  export type Concat<T1 extends any[], T2 extends any[]> = [...T1, ...T2]

  /**
   * same as Array.includes
   * @example
   * ```ts
   * Includes<['Kars', 'Esidisi'], 'Dio'> // expected to be `false`
   * ```
   */
  export type Includes<T extends readonly any[], U> = {
    [P in T[number]]: true
  }[U] extends true
    ? true
    : false

  /**
   * same as Array.push
   * @example
   * ```ts
   * type Result = Push<[1, 2], '3'> // [1, 2, '3']
   * ```
   */
  export type Push<T extends any[], Ext> = [...T, Ext]

  /**
   * same as Array.unshift
   * @example
   * ```ts
   * type Result = Unshift<[1, 2], '3'> // [0, 1, 2,]
   * ```
   */
  export type Unshift<T extends any[], Ext> = [Ext, ...T]

  /**
   * same as Array.pop
   * @example
   * ```ts
   * type Result = Pop<[1, 2, 3]> // [1, 2]
   * ```
   */
  // eslint-disable-next-line unused-imports/no-unused-vars
  export type Pop<T extends any[]> = T extends [...infer L, infer R] ? L : never

  /**
   * same as Array.shift
   * @example
   * ```ts
   * type Result = Shift<[1, 2, 3]> // [2, 3]
   * ```
   */
  // eslint-disable-next-line unused-imports/no-unused-vars
  export type Shift<T extends any[]> = T extends [infer L, ...infer R] ? R : never

  /**
   * same as Array.flat
   * @example
   * ```ts
   * type flatten = Flatten<[1, 2, [3, 4], [[[5]]]]> // [1, 2, 3, 4, 5]
   * ```
   */
  export type Flatten<S extends any[], T extends any[] = []> = S extends [
    infer X,
    ...infer Y,
  ]
    ? X extends any[]
      ? Flatten<[...X, ...Y], T>
      : Flatten<[...Y], [...T, X]>
    : T

  /**
   * Return without arr
   * @example
   * ```ts
   * type Res = Without<[1, 2, 4, 1, 5], [1, 2]> // expected to be [4, 5]
   * ```
   */
  export type Without<T, U> = T extends [infer R, ...infer F]
    ? R extends TupleToUnion<U>
      ? Without<F, U>
      : [R, ...Without<F, U>]
    : T

}
