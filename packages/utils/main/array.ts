/**
 * 过滤数组，callback里返回true的都放在[left,right]的left里，其余的在right
 */
export function filterList<T>(
  list: T[],
  callback: (data: T) => boolean,
): [T[], T[]] {
  const left: T[] = []
  const right: T[] = []
  list.forEach((l) => {
    const v = callback(l)
    v ? left.push(l) : right.push(l)
  })
  return [left, right]
}

export function newArray(len: number, fill: any = null) {
  return Array.from({ length: len }).fill(fill)
}
