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

/**
 * 将union类型宽松化
 * @example
 * ```ts
 * type Union = 'a' | 'b'
 * const a1: Union = 'c' // error
 * const a2: LooseUnion<Union> = 'c' // ok
 * ```
 */
export type LooseUnion<T> = T | (string & {})

/**
 * 过滤掉union类型中，以指定前缀开头的类型
 *
 * @example
 * ```ts
 * type Test = FilterUnionUnStartWith<'/aa','bb','/cc', 'dd', '/'> // 'bb' | 'dd'
 * ```
 */
export type FilterUnionUnStartWith<
  Union,
  Prefix extends string,
> = Union extends `${Prefix}${string}` ? never : Union

/**
 * 过滤掉union类型中，以指定前缀开头的类型
 *
 * @example
 * ```ts
 * type Test = FilterUnionStartWith<'/a','bb','/cc', '/'> // '/a' | '/cc'
 * ```
 */
export type FilterUnionStartWith<
  Union,
  Prefix extends string,
> = Union extends `${Prefix}${string}` ? Union : never
