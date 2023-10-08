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

export type RequiredLiteralKeys<T> = keyof {
  [K in keyof T as string extends K
    ? never
    : number extends K
    ? never
    : {} extends Pick<T, K>
    ? never
    : K]: 0
}

export type OptionalLiteralKeys<T> = keyof {
  [K in keyof T as string extends K
    ? never
    : number extends K
    ? never
    : {} extends Pick<T, K>
    ? K
    : never]: 0
}

export type IndexKeys<T> = string extends keyof T
  ? string
  : number extends keyof T
  ? number
  : never

export type KeyOfType<T, V> = keyof {
  [P in keyof T as T[P] extends V ? P : never]: any
}

export type OrPromise<T> = Promise<T> | T

export type ValueOf<T> = T[keyof T]

export type TypeOfMapToInstanceTypeMap<T extends Rec> = {
  [K in keyof T]: InstanceType<T[K]>
}
