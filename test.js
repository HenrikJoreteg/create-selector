const realCreateSelector = require('reselect').createSelector
const test = require('tape')
const createSelector = require('./index').createSelector
const resolveSelectors = require('./index').resolveSelectors

test('returns a deferred selector', (t) => {
  const lastFunc = (someId, sameId) => someId === sameId
  const deferredSelector = createSelector(
    'someString',
    'someOtherString',
    lastFunc
  )
  t.ok(deferredSelector.deps, 'should have deps flag')
  t.ok(deferredSelector.resultFunc === lastFunc, 'should still have resultFunc prop')

  const id = id => id
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

  // mix in a selector created by reselect
  const dep4 = realCreateSelector(
    idSelector,
    id => id
  )

  const final = createSelector(
    'dep1',
    dep2,
    'dep3',
    dep4,
    (id, thing, other, stuff) =>
      id === 'hi' &&
      id === thing &&
      id === other &&
      id === stuff
  )

  const obj = {
    idSelector,
    dep1,
    dep2,
    dep3,
    dep4,
    final
  }

  resolveSelectors(obj)

  t.ok(obj.final({id: 'hi'}) === true, 'as')
  t.end()
})

test('throws error if cannot resolve selectors because all string references', (t) => {
  t.throws(() => {
    resolveSelectors({
      dep1: createSelector(
        'dep1',
        one => one
      )
    })
  })
  t.end()
})

test('throws if unresolvable', (t) => {
  t.throws(() => {
    resolveSelectors({
      dep0: id => id,
      dep1: createSelector(
        'dep0',
        one => one
      ),
      dep2: createSelector(
        'somethingBogus',
        one => one
      )
    })
  })
  t.end()
})

test('tolerate selectors that don\'t exist on the shared object if not deferred', (t) => {
  const idSelector = state => state.id

  const dep1 = createSelector(
    idSelector,
    id => id
  )

  const dep2 = createSelector(
    idSelector,
    'dep1',
    (val1, val2) =>
      val1 === 'hi' &&
      val1 === val2
  )

  // note: this is missing the `idSelector`
  const obj = {
    dep1,
    dep2
  }

  t.doesNotThrow(() => {
    resolveSelectors(obj)
  })

  resolveSelectors(obj)

  t.ok(obj.dep2({id: 'hi'}) === true, 'as')
  t.end()
})
