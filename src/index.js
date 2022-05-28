const assign = Object.assign || ((a, b) => (b && Object.keys(b).forEach(k => (a[k] = b[k])), a))

const run = (isArr, copy, patch) => {
  const type = typeof patch
  if (patch && type === 'object') {
    if (Array.isArray(patch)) for (const p of patch) copy = run(isArr, copy, p)
    else {
      for (const k of Object.keys(patch)) {
        const val = patch[k]
        if (typeof val === 'function') copy[k] = val(copy[k], merge)
        else if (val === undefined) isArr && !isNaN(k) ? copy.splice(k, 1) : delete copy[k]
				else if (val === null || typeof val !== 'object' || val.constructor !== Object || Array.isArray(val)) copy[k] = val
        else if (typeof copy[k] === 'object') copy[k] = val === copy[k] ? val : merge(copy[k], val)
        else copy[k] = run(false, {}, val)
      }
    }
  } else if (type === 'function') copy = patch(copy, merge)
  return copy
}

const merge = (source, ...patches) => {
  const isArr = Array.isArray(source)
  return run(isArr, isArr ? source.slice() : assign({}, source), patches)
}

export default merge
