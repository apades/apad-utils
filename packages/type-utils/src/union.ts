/**
 * @example
 * ```ts
 * type Result = StringToUnion<'123'> // expected to be "1" | "2" | "3"
 * ```
 */
export type StringToUnion<T extends string> =
  T extends `${infer Letter}${infer Rest}`
    ? Letter | StringToUnion<Rest>
    : never

/**
 * @example
 * ```ts
 * type Test = TupleToUnion<['1', '2', '3']> // expected to be '1' | '2' | '3'
 * ```
 */
export type TupleToUnion<T> = T extends any[] ? T[number] : T

/**
 * array to union
 * @example
 * ```ts
 * type Test = ['1', '2']
 * type Test2 = ValueOf<Test> // expected '1' | '2'
 * ```
 * or
 * ```ts
 * const test = ['1', '2'] as const
 * type Test2 = ValueOf<typeof test> // expected '1' | '2'
 * ```
 */
export type ValueOf<T> = T[keyof T]

/**
 * @example
 * ```ts
 * type case1 = IsUnion<string> // false
 * type case2 = IsUnion<string | number> // true
 * ```
 */
export type IsUnion<T, C extends T = T> = (
  T extends T ? (C extends T ? true : unknown) : never
) extends true
  ? false
  : true
