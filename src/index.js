import { createSelector as realCreateSelector } from 'reselect'

const ensureFn = (obj, name) => {
  if (typeof name !== 'string') {
    return name
  }
  const found = obj[name]
  if (!found) {
    throw Error('No selector ' + name + ' found on the obj.')
  }
  return found
}

export const createSelector = (...fns) => {
  const resultFunc = fns.slice(-1)[0]
  const deferredSelector = (obj, deps) => {
    const newArgs = deps.map(fn => ensureFn(obj, fn))
    newArgs.push(resultFunc)
    return realCreateSelector(...newArgs)
  }
  deferredSelector.deps = fns.slice(0, -1)
  deferredSelector.resultFunc = resultFunc
  return deferredSelector
}

export const resolveSelectors = obj => {
  // an item is resolved if it is either a
  // function with no dependencies or if
  // it's on the object with no dependencies
  const isResolved = name => (name.call && !name.deps) || !obj[name].deps

  // flag for checking if we have *any*
  let hasAtLeastOneResolved = false

  // extract all deps and any resolved items
  for (const selectorName in obj) {
    const fn = obj[selectorName]
    if (!isResolved(selectorName)) {
      fn.deps = fn.deps.map((val, index) => {
        // if it is a function not a string
        if (val.call) {
          // look for it already on the object
          for (const key in obj) {
            if (obj[key] === val) {
              // return its name if found
              return key
            }
          }
          // we didn't find it and it doesn't have a name
          // but if it's a fully resolved selector that's ok
          if (!val.deps) {
            hasAtLeastOneResolved = true
            return val
          }
        }

        // the `val` is a string that exists on the object return the string
        // we'll resolve it later
        if (obj[val]) return val

        // if we get here, its a string that doesn't exist on the object
        // which won't work, so we throw a helpful error
        throw Error(
          `The input selector at index ${index} for '${selectorName}' is missing from the object passed to resolveSelectors()`
        )
      })
    } else {
      hasAtLeastOneResolved = true
    }
  }

  if (!hasAtLeastOneResolved) {
    throw Error(
      `You must pass at least one real selector. If they're all string references there's no`
    )
  }

  const depsAreResolved = deps => deps.every(isResolved)

  const resolve = () => {
    let hasUnresolved = false
    for (const selectorName in obj) {
      const fn = obj[selectorName]
      if (!isResolved(selectorName)) {
        hasUnresolved = true
        if (depsAreResolved(fn.deps)) {
          // we could just use `obj[selectorName] = fn(obj, fn.deps)`, but that
          // has a significant performance impact when trying to perform this
          // on a large object (> 1000). More on this here:
          // http://2ality.com/2014/01/object-assign.html
          const selectorFn = fn(obj, fn.deps)
          delete obj[selectorName]
          obj[selectorName] = selectorFn
        }
      }
    }
    return hasUnresolved
  }

  let startTime
  while (resolve()) {
    if (!startTime) startTime = Date.now()
    const duration = Date.now() - startTime
    if (duration > 500) {
      throw Error('Could not resolve selector dependencies.')
    }
  }

  return obj
}
