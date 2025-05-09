import type { Reverse } from './array'

/**
 * extend function argument
 * @example
 * ```ts
 * type Fn = (a: number, b: string) => number
 * type Result = AppendArgument<Fn, boolean> // expected (a: number, b: string, x: boolean) => number
 * ```
 */
export type AppendArgument<Fn, Ext> = Fn extends (...args: infer R) => infer T
  ? (...args: [...R, Ext]) => T
  : never

/**
 * flip function argument
 * @example
 * ```ts
 * type Fn = (a: number, b: string, c: boolean) => void
 * type Result = FlipArguments<Fn, boolean> // expected (a: boolean, b: string, c: number) => void
 * ```
 */
export type FlipArguments<T extends (...args: any[]) => any> = T extends (
  ...args: infer P
) => infer U
  ? (...args: Reverse<P>) => U
  : never
