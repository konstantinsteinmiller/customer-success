export function deepCompare(
  obj1: any,
  obj2: any,
  path: string = ''
): { changed: boolean; changes?: Record<string, [any, any]> } {
  // if (obj1 === obj2) {
  //   return { changed: false }
  // }

  if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
    return { changed: true, changes: { [path || '']: [obj1, obj2] } }
  }

  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)

  const allKeys = [...new Set([...keys1, ...keys2])] // Get all unique keys

  const changes: Record<string, [any, any]> = {}
  let changed = false

  for (const key of allKeys) {
    const value1 = obj1[key]
    const value2 = obj2[key]
    const currentPath = `${path ? path + '.' : ''}${key}`

    if (value1 === value2) {
      continue // Skip if strictly equal (though we're ignoring reference later)
    }

    const isObject1 = typeof value1 === 'object' && value1 !== null
    const isObject2 = typeof value2 === 'object' && value2 !== null

    if (isObject1 && isObject2) {
      const nestedResult = deepCompare(value1, value2, currentPath)
      if (nestedResult.changed) {
        changed = true
        if (nestedResult.changes) {
          Object.assign(changes, nestedResult.changes)
        } else {
          changes[currentPath] = [value1, value2]
        }
      }
    } else if (Array.isArray(value1) && Array.isArray(value2)) {
      if (value1.length !== value2.length) {
        changes[currentPath] = [value1, value2]
        changed = true
      } else {
        for (let i = 0; i < value1.length; i++) {
          const nestedResult = deepCompare(value1[i], value2[i], `${currentPath}[${i}]`)
          if (nestedResult.changed) {
            changed = true
            if (nestedResult.changes) {
              Object.assign(changes, nestedResult.changes)
            } else {
              changes[`${currentPath}[${i}]`] = [value1[i], value2[i]]
            }
          }
        }
      }
    } else if (value1 !== value2) {
      changes[currentPath] = [value1, value2]
      changed = true
    }
  }

  return { changed, ...(changed && { changes }) }
}

export const isProduction = process.env.NODE_ENV === 'production'
const env = process.env.NODE_ENV
let baseURL = import.meta.env.BASE_URL
baseURL = baseURL.slice(0, baseURL.length - 1)
// console.log('baseURL: ', baseURL, isProduction, env)
export const prependBaseUrl = (url: string): string => (isProduction ? `${baseURL}${url}` : url)
