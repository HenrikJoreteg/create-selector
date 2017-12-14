'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var reselect = require('reselect');

var ensureFn = function (obj, name) {
  if (typeof name !== 'string') {
    return name
  }
  var found = obj[name];
  if (!found) {
    throw Error('No selector ' + name + ' found on the obj.')
  }
  return found
};

var createSelector$1 = function () {
  var fns = [], len = arguments.length;
  while ( len-- ) fns[ len ] = arguments[ len ];

  var resultFunc = fns.slice(-1)[0];
  var deferredSelector = function (obj, deps) {
    var newArgs = deps.map(function (fn) { return ensureFn(obj, fn); });
    newArgs.push(resultFunc);
    return reselect.createSelector.apply(void 0, newArgs)
  };
  deferredSelector.deps = fns.slice(0, -1);
  deferredSelector.resultFunc = resultFunc;
  return deferredSelector
};

var resolveSelectors = function (obj) {
  // an item is resolved if it is either a
  // function with no dependencies or if
  // it's on the object with no dependencies
  var isResolved = function (name) { return (name.call && !name.deps) || !obj[name].deps; };

  // flag for checking if we have *any*
  var hasAtLeastOneResolved = false;

  // extract all deps and any resolved items
  var loop = function ( selectorName ) {
    var fn = obj[selectorName];
    if (!isResolved(selectorName)) {
      fn.deps = fn.deps.map(function (val, index) {
        // if it is a function not a string
        if (val.call) {
          // look for it already on the object
          for (var key in obj) {
            if (obj[key] === val) {
              // return its name if found
              return key
            }
          }
          // we didn't find it and it doesn't have a name
          // but if it's a fully resolved selector that's ok
          if (!val.deps) {
            hasAtLeastOneResolved = true;
            return val
          }
        }

        // the `val` is a string that exists on the object return the string
        // we'll resolve it later
        if (obj[val]) { return val }

        // if we get here, its a string that doesn't exist on the object
        // which won't work, so we throw a helpful error
        throw Error(("The input selector at index " + index + " for '" + selectorName + "' is missing from the object passed to resolveSelectors()"))
      });
    } else {
      hasAtLeastOneResolved = true;
    }
  };

  for (var selectorName in obj) loop( selectorName );

  if (!hasAtLeastOneResolved) {
    throw Error("You must pass at least one real selector. If they're all string references there's no")
  }

  var depsAreResolved = function (deps) { return deps.every(isResolved); };

  var resolve = function () {
    var hasUnresolved = false;
    for (var selectorName in obj) {
      var fn = obj[selectorName];
      if (!isResolved(selectorName)) {
        hasUnresolved = true;
        if (depsAreResolved(fn.deps)) {
          obj[selectorName] = fn(obj, fn.deps);
        }
      }
    }
    return hasUnresolved
  };

  var startTime;
  while (resolve()) {
    if (!startTime) { startTime = Date.now(); }
    var duration = Date.now() - startTime;
    if (duration > 500) {
      throw Error('Could not resolve selector dependencies.')
    }
  }

  return obj
};

exports.createSelector = createSelector$1;
exports.resolveSelectors = resolveSelectors;
