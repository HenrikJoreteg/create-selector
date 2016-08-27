# create-selector

![](https://img.shields.io/npm/dm/create-selector.svg)![](https://img.shields.io/npm/v/create-selector.svg)![](https://img.shields.io/npm/l/create-selector.svg)[![No Maintenance Intended](http://unmaintained.tech/badge.svg)](http://unmaintained.tech/)

Simple util that wraps reselect's `createSelector` and behaves like usual if you use it like usual. See the [reselect project](https://github.com/reactjs/reselect) for more info.

*But*, you can also pass strings as placeholders for some, or all, of the input functions. In this mode it returns a function that will create the selector when called with an object containing the missing functions as properties.

In this way you can defer the creation of a selector and populate it later without needing to have direct references to the input selectors when you're first defining it.

Just like reselect, it also attaches the last function as a `.resultFunc` property for easy testing without needing all the input functions.

## example

```js
import createSelector from 'create-selector'

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

// and make sure they're all populated into real selectors
for (const key in selectorAggregator) {
  const item = selectorAggregator[key]
  if (item.isDeferred) {
    selectorAggregator[key] = item(selectorAggregator)
  }
}
```

that's it!

## Notes

- There's some tests to show this does what it's supposed to but most of the actual work happens in reselect.
- I wrote it in ES5 because I didn't want a compile step for something so simple.

## install

```
npm install create-selector
```

## credits

If you like this follow [@HenrikJoreteg](http://twitter.com/henrikjoreteg) on twitter. But in terms of credit, this is just a simple util on top of [reselect](https://github.com/reactjs/reselect) all the real magic is in there.

## license

[MIT](http://mit.joreteg.com/)
