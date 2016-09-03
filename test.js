const realCreateSelector = require('reselect').createSelector
const test = require('tape')
const createSelector = require('./index').createSelector
const resolveSelectors = require('./index').resolveSelectors

const id = id => id

test('returns a deferred selector', (t) => {
  const lastFunc = (someId, sameId) => someId === sameId
  const deferredSelector = createSelector(
    'someString',
    'someOtherString',
    lastFunc
  )
  t.ok(deferredSelector.deps, 'should have deps flag')
  t.ok(deferredSelector.resultFunc === lastFunc, 'should still have resultFunc prop')

  const sel = deferredSelector({someString: id, someOtherString: id}, ['someString', 'someOtherString'])
  t.ok(!sel.deps, 'should not have deps')
  t.ok(sel.resultFunc === lastFunc, 'should have resultFunc prop')
  t.ok(sel() === true, 'returns true when ran')
  t.end()
})

test('resolves multiple levels down', (t) => {
  const idSelector = state => state.id

  const dep1 = createSelector(
    'idSelector',
    id => id
  )

  const dep2 = createSelector(
    'dep1',
    id => id
  )

  // mix in a selector created by reselect
  const dep3 = realCreateSelector(
    idSelector,
    id => id
  )

  const final = createSelector(
    'dep1',
    dep2,
    dep3,
    (id, thing, other) =>
      id === 'hi' &&
      id === thing &&
      id === other
  )

  const obj = {
    idSelector,
    dep1,
    dep2,
    dep3,
    final
  }

  resolveSelectors(obj)

  t.ok(obj.final({id: 'hi'}) === true, 'as')
  t.end()
})
