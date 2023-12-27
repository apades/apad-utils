export type Noop = (this: any, ...args: any[]) => any
export type Rec<T = any> = {
  [key: string]: T
}
export type IfEquals<X, Y, A = X, B = never> = (<T>() => T extends X
  ? 1
  : 2) extends <T>() => T extends Y ? 1 : 2
  ? A
  : B

/**
 * with key hint support omit
 */
export type Omit<T, Keys extends keyof T> = {
  [P in keyof T as P extends Keys ? never : P]: T[P]
}

/**
 * with key hint support Exclude
 */
export type Exclude<T, Keys extends T> = T extends Keys ? never : T

export type OmitNever<T> = {
  [K in keyof T as T[K] extends never ? never : K]: T[K]
}
