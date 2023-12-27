import { IfEquals } from './utils'

type DeepWritablePrimitive =
  | undefined
  | null
  | boolean
  | string
  | number
  // eslint-disable-next-line @typescript-eslint/ban-types
  | Function

/**
 * remove all readonly key
 *
 * @example
 * ```ts
 * type Test = {
 *    readonly a: string
 *    b: boolean
 * }
 *
 * type Test2 = DeepWritable<Test> // expected { b:boolean }
 * ```
 */
export type DeepWritable<T> = T extends DeepWritablePrimitive
  ? T
  : T extends Array<infer U>
  ? DeepWritableArray<U>
  : T extends Map<infer K, infer V>
  ? DeepWritableMap<K, V>
  : T extends Set<infer T>
  ? DeepWritableSet<T>
  : DeepWritableObject<T>

type DeepWritableArray<T> = Array<DeepWritable<T>>
type DeepWritableMap<K, V> = Map<K, DeepWritable<V>>
type DeepWritableSet<T> = Set<DeepWritable<T>>
type DeepWritableObject<T> = {
  [K in WritableKeys<T>]: DeepWritable<T[K]>
}

export type WritableKeys<T> = {
  [P in keyof T]: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P>
}[keyof T]

/**
 * required keys to union
 * @example
 * ```ts
 * type Test = {
 *    a: string
 *    b: boolean
 *    c?: number
 * }
 * type Test2 = RequiredLiteralKeys<Test> // expected 'a' | 'b'
 * ```
 */
export type RequiredLiteralKeys<T> = keyof {
  [K in keyof T as string extends K
    ? never
    : number extends K
    ? never
    : {} extends Pick<T, K>
    ? never
    : K]: 0
}

/**
 * optional keys to union
 * @example
 * ```ts
 * type Test = {
 *    a: string
 *    b?: boolean
 *    c?: number
 * }
 * type Test2 = OptionalLiteralKeys<Test> // expected 'b' | 'c'
 * ```
 */
export type OptionalLiteralKeys<T> = keyof {
  [K in keyof T as string extends K
    ? never
    : number extends K
    ? never
    : {} extends Pick<T, K>
    ? K
    : never]: 0
}

/**
 * set all key to optional exclude Keys
 * @example
 * ```ts
 * type Test = {
 *    a: string
 *    b: boolean
 *    c: number
 * }
 * type Test2 = OptionalKeysExclude<Test,'a'| 'b'> // expected { a:string; b:boolean; c?:number }
 * ```
 */
export type OptionalKeysExclude<T, Keys extends keyof T> = Partial<T> & {
  [K in Keys]: T[K]
}

/**
 * set keys to optional
 * @example
 * ```ts
 * type Test = {
 *    a: string
 *    b: boolean
 *    c: number
 * }
 * type Test2 = OptionalKeysInclude<Test,'a'| 'b'> // expected { a?:string; b?:boolean; c:number }
 * ```
 */
export type OptionalKeysInclude<T, Keys extends keyof T> = Partial<T> & {
  [K in Keys]: T[K]
}

/**
 * to object entries
 * @example
 * ```ts
 * type Test = {
 *    a: string
 *    b: boolean
 * }
 * type Test2 = Entries<Test> // expected (["a", string] | ["b", boolean])[]
 * ```
 */
export type Entries<T> = {
  [K in keyof T]: [K, T[K]]
}[keyof T][]

type Test = {
  a: string
  b: boolean
}
