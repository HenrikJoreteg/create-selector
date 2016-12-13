import { createSelector as realCreateSelector } from 'reselect'

const slice = [].slice

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
  const isResolved = name =>
    !obj[name].deps

  let hasAtLeastOneResolved = false
  // extract all deps and any resolved items
  for (const selectorName in obj) {
    const fn = obj[selectorName]
    if (!isResolved(selectorName)) {
      fn.deps = fn.deps.map(val => {
        if (!val) {
          throw Error('Invalid input dependency found for ' + selectorName)
        }
        // is it already just a name
        if (obj[val]) return val
        // if not, look for it
        for (const key in obj) {
          if (obj[key] === val) return key
        }
      })
    } else {
      hasAtLeastOneResolved = true
    }
  }

  if (!hasAtLeastOneResolved) {
    throw Error('Must have some inputs that don\'t have dependencies')
  }

  const depsAreResolved = deps => deps.every(isResolved)

  const resolve = () => {
    let hasUnresolved = false
    for (const selectorName in obj) {
      const fn = obj[selectorName]
      if (!isResolved(selectorName)) {
        hasUnresolved = true
        if (depsAreResolved(fn.deps)) {
          obj[selectorName] = fn(obj, fn.deps)
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
