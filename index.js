'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var reselect = require('reselect');

const ensureFn = (obj, name) => {
  if (typeof name !== 'string') {
    return name
  }
  const found = obj[name];
  if (!found) {
    throw Error('No selector ' + name + ' found on the obj.')
  }
  return found
};

const createSelector$1 = (...fns) => {
  const resultFunc = fns.slice(-1)[0];
  const deferredSelector = (obj, deps) => {
    const newArgs = deps.map(fn => ensureFn(obj, fn));
    newArgs.push(resultFunc);
    return reselect.createSelector(...newArgs)
  };
  deferredSelector.deps = fns.slice(0, -1);
  deferredSelector.resultFunc = resultFunc;
  return deferredSelector
};

const resolveSelectors = obj => {
  const isResolved = name =>
    !obj[name].deps;

  let hasAtLeastOneResolved = false;
  // extract all deps and any resolved items
  for (const selectorName in obj) {
    const fn = obj[selectorName];
    if (!isResolved(selectorName)) {
      fn.deps = fn.deps.map((val, index) => {
        // is it already just a name
        if (obj[val]) return val
        // if not, look for it
        for (const key in obj) {
          if (obj[key] === val) {
            return key
          }
        }
        throw Error(`The input selector at index ${index} for '${selectorName}' is missing from the object passed to resolveSelectors()`)
      });
    } else {
      hasAtLeastOneResolved = true;
    }
  }

  if (!hasAtLeastOneResolved) {
    throw Error(`You must pass at least one real selector. If they're all string references there's no`)
  }

  const depsAreResolved = deps => deps.every(isResolved);

  const resolve = () => {
    let hasUnresolved = false;
    for (const selectorName in obj) {
      const fn = obj[selectorName];
      if (!isResolved(selectorName)) {
        hasUnresolved = true;
        if (depsAreResolved(fn.deps)) {
          obj[selectorName] = fn(obj, fn.deps);
        }
      }
    }
    return hasUnresolved
  };

  let startTime;
  while (resolve()) {
    if (!startTime) startTime = Date.now();
    const duration = Date.now() - startTime;
    if (duration > 500) {
      throw Error('Could not resolve selector dependencies.')
    }
  }

  return obj
};

exports.createSelector = createSelector$1;
exports.resolveSelectors = resolveSelectors;
