const test = require('tape')
const createSelector = require('./index')

const id = id => id

test('returns a real selector if passed functions', (t) => {
  const lastFunc = (someId, sameId) => someId === sameId
  const sel = createSelector(
    id,
    id,
    lastFunc
  )
  t.ok(!sel.isDeferred, 'should not have deferred flag')
  t.ok(sel.resultFunc === lastFunc, 'should have resultFunc prop')
  t.ok(sel() === true, 'returns true when ran')
  t.end()
})

test('returns a deferred selector if passed strings', (t) => {
  const lastFunc = (someId, sameId) => someId === sameId
  const deferredSelector = createSelector(
    'someString',
    'someOtherString',
    lastFunc
  )
  t.ok(deferredSelector.isDeferred, 'should have deferred flag')
  t.ok(deferredSelector.resultFunc === lastFunc, 'should still have resultFunc prop')

  const sel = deferredSelector({someString: id, someOtherString: id})
  t.ok(!sel.isDeferred, 'should not have deferred flag')
  t.ok(sel.resultFunc === lastFunc, 'should have resultFunc prop')
  t.ok(sel() === true, 'returns true when ran')
  t.end()
})
