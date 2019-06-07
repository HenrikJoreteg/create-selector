# create-selector

![](https://img.shields.io/npm/dm/create-selector.svg)![](https://img.shields.io/npm/v/create-selector.svg)![](https://img.shields.io/npm/l/create-selector.svg)[![No Maintenance Intended](http://unmaintained.tech/badge.svg)](http://unmaintained.tech/)

Simple util that wraps reselect's `createSelector` but adds the ability to define selector dependencies as strings, then resolve them later.

This makes it easier to compose selectors from different parts of your app or combine functionality from different app bundles without having to have direct references to input functions when you're defining them.

In this way you can defer the creation of a selector and populate it later without needing to have direct references to the input selectors when you're first defining it.

Just like reselect, it also attaches the last function as a `.resultFunc` property for easy testing without needing all the input functions.

## example

```js
import { createSelector, resolveSelectors } from 'create-selector'

export const selectUserData = state => state.user
export const shouldFetchData = createSelector(
  'selectIsLoggedIn',
  selectUserData,
  (loggedIn, userData) => {
    if (loggedIn && !userData) {
      return true
    }
  }
)
```

```js
import { shouldFetchData } from './other-selectors'
import { selectIsLoggedIn } from './auth-selectors'

// later, you can aggregate them
const selectorAggregator = {
  selectIsLoggedIn,
  shouldFetchData
}

// resolves all the string references with the real ones recursively
// until you've got an object with all your selectors combined
resolveSelectors(selectorAggregator)
```

that's it!

## Notes

- There's some tests to show this does what it's supposed to but most of the actual work happens in reselect.
- It tolerates mixing in _real_ selectors too (even if they were created with reselect, directly).

## install

```
npm install create-selector
```

## changes

- `5.0.0` Removed source maps from build. Fixed npm security warnings w/ audit.
- `4.0.3` Optimizing selector resolution algorithm. Huge thanks to [@rudionrails](https://github.com/rudionrails) and [@layflags](https://github.com/layflags).
- `4.0.1` building with microbundle (should fix issues with module field in package.json)
- `2.2.0`
  - added support for fully resolved input selectors not having to be on the final object
  - improved error handling
  - more test coverage
  - updated dependencies

## credits

If you like this follow [@HenrikJoreteg](http://twitter.com/henrikjoreteg) on twitter. But in terms of credit, this is just a simple util on top of [reselect](https://github.com/reactjs/reselect) all the real magic is in there.

## license

[MIT](http://mit.joreteg.com/)
