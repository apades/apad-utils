import type { Array } from './array'
import type { String } from './string'
import type { FilterUnionUnStartWith } from './union'

export type Noop = (this: any, ...args: any[]) => any
export interface Rec<T = any> {
  [key: string]: T
}
export type IfEquals<X, Y, A = X, B = never> = (<T>() => T extends X
  ? 1
  : 2) extends <T>() => T extends Y ? 1 : 2
  ? A
  : B

/**
 * 进阶版Omit，带有key提示的
 */
export type Omit<T, Keys extends keyof T> = {
  [P in keyof T as P extends Keys ? never : P]: T[P]
}

/**
 * 进阶版Exclude，带有key提示的
 */
export type Exclude<T, Keys extends T> = T extends Keys ? never : T

/**
 * ReturnType改良版，支持拆解Promise
 *
 * @example
 * ```ts
 * type T1 = ReturnTypeImp<() => number> // number
 * type T2 = ReturnTypeImp<() => Promise<number>> // number
 * ```
 */
export type ReturnTypeImp<T extends (...arg: any[]) => any> = T extends (...arg: any[]) => infer Res
  ? Res extends Promise<infer R>
    ? R
    : Res
  : void

 type Concat<K extends string, P extends string> = `${K}${'' extends P ? '' : '.'}${P}`

/**
 * 将Object的深度key转成union，进阶版不要父节点的{@link DeepLeafKeys DeepLeafKeys}
 *
 * @example
 * ```ts
 * // ！特别注意，传type只能是type，interface不可以
 * type Obj = {
 *  a: {
 *     a1: number
 *    a2: string
 *  }
 *  b: {
 *     b1: boolean
 *  }
 *  c: number
 * }
 * type T = DeepKeys<Obj> // 'a' | 'a.a1' | 'a.a2' | 'b' | 'b.b1' | 'c'
 * ```
 */
export type DeepKeys<T> = T extends Record<string, unknown>
  ? {
      [K in keyof T]-?: `${K & string}` | Concat<K & string, DeepKeys<T[K]>>
    }[keyof T]
  : ''

/**
 * 将Object的深度key转成union，排除父节点版本
 *
 * @example
 * ```ts
 * // ！特别注意，传type只能是type，interface不可以
 * type Obj = {
 *  a: {
 *     a1: number
 *    a2: string
 *  }
 *  b: {
 *     b1: boolean
 *  }
 *  c: number
 * }
 * type T = DeepKeys<Obj> // 'a.a1' | 'a.a2' | 'b.b1' | 'c'
 * ```
 */
export type DeepLeafKeys<T> = T extends Record<string, unknown>
  ? { [K in keyof T]-?: Concat<K & string, DeepKeys<T[K]>> }[keyof T]
  : ''

/**
 * 拆解path的:params成union
 *
 * @example
 * ```ts
 * type Params = GetPathParamsUnion<'/path/p2/:a1/p4/p5/:a2/p3'> // 'a1' | 'a2'
 * ```
 */
export type GetPathParamsUnion<Path extends string> = Array.First<String.Split<'/', FilterUnionUnStartWith<String.SplitToUnion<'/:', Path>, '/'>>>
