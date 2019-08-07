const _SUB = {}
export const SUB = run => ({ _SUB, run })
export const DEL = {}

const assign = Object.assign || ((a, b) => (b && Object.keys(b).forEach(k => (a[k] = b[k])), a))

const run = (isArr, copy, patch) => {
  const type = typeof patch
  if (patch && type === 'object') {
    if (Array.isArray(patch)) for (const p of patch) copy = run(isArr, copy, p)
    else if (patch._SUB === _SUB) copy = patch.run
    else {
      for (const k of Object.keys(patch)) {
        const val = patch[k]
        if (typeof val === 'function') copy[k] = val(copy[k])
        else if (val == null || typeof val !== 'object' || Array.isArray(val)) copy[k] = val
        else if (val === DEL) isArr && !isNaN(k) ? copy.splice(k, 1) : delete copy[k]
        else if (val._SUB === _SUB) copy[k] = val.run
        else if (typeof copy[k] === 'object' && val !== copy[k]) copy[k] = merge(copy[k], val)
        else copy[k] = val
      }
    }
  } else if (type === 'function') copy = run(isArr, copy, patch(copy))
  return copy
}

const merge = (source, ...patches) => {
  const isArr = Array.isArray(source)
  return run(isArr, isArr ? source.slice() : assign({}, source), patches)
}

export default merge
