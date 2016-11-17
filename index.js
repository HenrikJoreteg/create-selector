var realCreateSelector = require('reselect').createSelector
var slice = [].slice

var ensureFn = function (obj, name) {
  if (typeof name !== 'string') {
    return name
  }
  var found = obj[name]
  if (!found) {
    throw Error('No selector ' + name + ' found on the obj.')
  }
  return found
}

var createSelector = function () {
  var fns = slice.call(arguments)
  var resultFunc = fns.slice(-1)[0]
  function deferredSelector (obj, deps) {
    var newArgs = deps.map(function (fn) { return ensureFn(obj, fn) })
    newArgs.push(resultFunc)
    return realCreateSelector.apply(undefined, newArgs)
  }
  deferredSelector.deps = fns.slice(0, -1)
  deferredSelector.resultFunc = resultFunc
  return deferredSelector
}

var resolveSelectors = function (obj) {
  var isResolved = function (name) {
    return !obj[name].deps
  }

  var hasAtLeastOneResolved = false
  // extract all deps and any resolved items
  for (var selectorName in obj) {
    var fn = obj[selectorName]
    if (!isResolved(selectorName)) {
      fn.deps = fn.deps.map(function (val) {
        if (!val) {
          throw Error('Invalid input dependency found for ' + selectorName)
        }
        // is it already just a name
        if (obj[val]) return val
        // if not, look for it
        for (var key in obj) {
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

  var depsAreResolved = function (deps) {
    return deps.every(isResolved)
  }

  var resolve = function () {
    var hasUnresolved = false
    for (var selectorName in obj) {
      var fn = obj[selectorName]
      if (!isResolved(selectorName)) {
        hasUnresolved = true
        if (depsAreResolved(fn.deps)) {
          obj[selectorName] = fn(obj, fn.deps)
        }
      }
    }
    return hasUnresolved
  }

  var startTime
  while (resolve()) {
    if (!startTime) startTime = Date.now()
    var duration = Date.now() - startTime
    if (duration > 500) {
      throw Error('Could not resolve selector dependencies.')
    }
  }

  return obj
}

module.exports = {
  createSelector: createSelector,
  resolveSelectors: resolveSelectors
}
