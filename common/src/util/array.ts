export function groupBy<T, K extends keyof any> (items: Iterable<T>, keySelector: (value: T, index: number) => K): {[P in K]: T[]} {
  const groups: {[P in K]: T[]} = {} as {[P in K]: T[]}

  let i = 0;
  for (const item of items) {
    const key = keySelector(item, i++)
    if (key in groups) {
      groups[key].push(item)
    } else {
      groups[key] = [item]
    }
  }

  return groups
}
