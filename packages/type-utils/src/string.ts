// eslint-disable-next-line ts/no-namespace
export namespace String {
  /**
   * 同等String.split
   *
   * @example
   * ```ts
   * type Split = SplitStringToArray<'/', '/path/to/file.html'> // ['path', 'to', 'file.html']
   * const sp: Split = ['path', 'to', 'file.html']
   * ```
   */
  export type Split<
    split extends string,
    tarString extends string,
  > = tarString extends `${infer tPre}${split}${infer tTail}`
    ? [tPre, ...String.Split<split, tTail>]
    : [tarString]

  /**
   * 按字符将字符串拆分成联合类型
   *
   * @example 用来拆解路径成联合类型
   * ```ts
   * type Split = SplitStringToUnion<'/', '/path/to/file.html'> // 'path' | 'to' | 'file.html'
   * const sp: Split = 'file.html'
   * ```
   */
  export type SplitToUnion<
    split extends string,
    tarString extends string,
  > = tarString extends `${infer tPre}${split}${infer tTail}`
    ? tPre | String.SplitToUnion<split, tTail>
    : tarString

  /**
   * 按模板将字符串拆分成联合类型
   *
   * @example 用来拆解i18n的字符插值模板
   * ```ts
   * type Split1 = SplitTemplateStringToUnion<'{content}', 'aaa {a1} {a2} bbbb'> // 'a1' | 'a2'
   * const sp: Split1 = 'a1'
   *
   * type Split2 = SplitTemplateStringToUnion<'%content%', 'aaa %a1% %a2% bbbb'> // 'a1' | 'a2'
   * const sp: Split2 = 'a1'
   * ```
   */
  export type SplitTemplateStringToUnion<
    template extends `${string}content${string}`,
    tarString extends string,
  > = template extends `${infer Prefix}content${infer Tail}`
    ? tarString extends `${infer tPre}${Prefix}${infer Content}${Tail}${infer tTail}`
      ? Content | SplitTemplateStringToUnion<template, `${tPre}${tTail}`>
      : never
    : never
}
