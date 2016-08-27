var realCreateSelector = require('reselect').createSelector
var slice = [].slice

var ensureFn = function (obj, name) {
  if (typeof name !== 'string') {
    return name
  }
  var found = obj[name]
  if (!found) {
    throw Error(`No selector '${name}' found on the obj.`)
  }
  return found
}

var createSelector = function () {
  var fns = slice.call(arguments)
  var hasStrings = fns.some(function (fn) { return typeof fn === 'string' })
  if (!hasStrings) {
    return realCreateSelector.apply(undefined, fns)
  }
  function deferredSelector (obj) {
    var newArgs = fns.map(function (fn) { return ensureFn(obj, fn) })
    return realCreateSelector.apply(undefined, newArgs)
  }
  deferredSelector.isDeferred = true
  deferredSelector.resultFunc = fns.slice(-1)[0]
  return deferredSelector
}

module.exports = createSelector
