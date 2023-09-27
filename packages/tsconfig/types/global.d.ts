export type Rec<T = any> = {
  [key: string]: T
}
export type noop = (this: any, ...args: any[]) => any

type IfEquals<X, Y, A = X, B = never> = (<T>() => T extends X ? 1 : 2) extends <
  T
>() => T extends Y ? 1 : 2
  ? A
  : B

type WritableKeys<T> = {
  [P in keyof T]: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P>
}[keyof T]

type DeepWritablePrimitive =
  | undefined
  | null
  | boolean
  | string
  | number
  // eslint-disable-next-line @typescript-eslint/ban-types
  | Function
/**返回去除readOnly字段的type */
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

export type noop = (this: any, ...args: any[]) => any
