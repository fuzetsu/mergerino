const _SUB = {}
export const SUB = run => ({ _SUB, run })
export const DEL = {}

const assign = Object.assign || ((a, b) => (Object.keys(b).forEach(k => (a[k] = b[k])), a))
const flat = arr =>
  arr.reduce((acc, x) => (Array.isArray(x) ? acc.push(...flat(x)) : acc.push(x), acc), [])

const merge = (source, ...patches) => {
  const isArr = Array.isArray(source)
  let res = isArr ? source.slice() : assign({}, source)
  for (const patch of flat(patches)) {
    const type = typeof patch
    if (patch && type === 'object') {
      if (patch._SUB === _SUB) res = patch.run
      else {
        for (const k of Object.keys(patch)) {
          const val = patch[k]
          if (val == null || typeof val !== 'object' || Array.isArray(val)) res[k] = val
          else if (val === DEL) isArr && !isNaN(k) ? res.splice(k, 1) : delete res[k]
          else if (val._SUB === _SUB)
            res[k] = typeof val.run === 'function' ? val.run(res[k]) : val.run
          else if (typeof res[k] === 'object' && val !== res[k]) res[k] = merge(res[k], val)
          else res[k] = val
        }
      }
    } else if (type === 'function') res = merge(res, patch(res))
  }
  return res
}

export default merge
