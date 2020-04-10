#!/usr/bin/env node
/* global require */
const test = require('ava')

const depPath = './dist/mergerino.es5.js'
const merge = require(depPath)

// create version that uses assign polyfill
const save = Object.assign
Object.assign = null
delete require.cache[require.resolve(depPath)]
const noAssignMerge = require(depPath)
Object.assign = save

test('deleting works', t => {
  const state = { prop: true, other: true, deep: { prop: 'foo' } }
  const newState = merge(state, {
    prop: undefined,
    deep: { prop: undefined },
    fake: undefined, // deleting non existent key
    other: null
  })

  t.deepEqual(newState, { other: null, deep: {} })
  t.deepEqual(state, { prop: true, other: true, deep: { prop: 'foo' } })
})

test('function sub works', t => {
  const state = { age: 10, name: 'bob', obj: { prop: true } }
  const newState = merge(state, {
    age: x => x * 10,
    obj: () => ({ replaced: true }),
    name: (x, m) => {
      t.is(m, merge) // verify that merge is passed as second arg
      return x
    }
  })
  t.deepEqual(newState, { age: 100, name: 'bob', obj: { replaced: true } })
  t.deepEqual(state, { age: 10, name: 'bob', obj: { prop: true } })
})

test('deep function sub to uncreated object path', t => {
  const state = { orig: true }
  const newState = merge(state, {
    add: { stats: { count: x => (x == null ? 1 : x + 1) } }
  })
  t.deepEqual(newState, { orig: true, add: { stats: { count: 1 } } })
  t.deepEqual(state, { orig: true })
})

test('add nested object', t => {
  const state = { age: 10 }
  const add = { sub: true }
  const newState = merge(state, { add })
  t.deepEqual(newState, { age: 10, add: { sub: true } })
  t.not(newState.add, add)
  t.not(newState, state)
})

test('deep merge objects', t => {
  const state = { age: 10, sub: { sub: { prop: true } } }
  const newState = merge(state, { sub: { sub: { newProp: true } } })
  t.deepEqual(state, { age: 10, sub: { sub: { prop: true } } })
  t.deepEqual(newState, { age: 10, sub: { sub: { prop: true, newProp: true } } })
  t.not(newState, state)
  t.not(newState.sub, state.sub)
  t.not(newState.sub.sub, state.sub.sub)
})

test('function patch', t => {
  const state = { age: 10, foo: 'bar' }
  const newState = merge(state, s => {
    t.not(s, state)
    t.deepEqual(s, state)
    return merge(s, { prop: true })
  })
  t.deepEqual(newState, { age: 10, foo: 'bar', prop: true })
})

test('multi/array/falsy patches', t => {
  const state = { foo: 'bar' }
  const newState = merge(
    state,
    { baz: 5 },
    { hello: false },
    [{ arr: [1, 2, 3] }, [[{ prop: true }]], false, null],
    undefined,
    '',
    0,
    null,
    (s, m) => m(s, { age: 10 }),
    [[[[[[[{ age: x => x * 3 }]]]]]]]
  )
  t.not(newState, state)
  t.deepEqual(state, { foo: 'bar' })
  t.deepEqual(newState, {
    foo: 'bar',
    baz: 5,
    prop: true,
    hello: false,
    arr: [1, 2, 3],
    age: 30
  })
})

test('array patches', t => {
  const arr = [1, 2, 3]
  const newArr = merge(arr, { 2: 100 }, { 0: undefined }, { 0: 200 })
  t.not(newArr, arr)
  t.deepEqual(newArr, [200, 100])
  t.deepEqual(arr, [1, 2, 3])
})

test('deep merge with arr', t => {
  const state = { foo: 'bar', deep: { arr: [1, 2, 3], prop: false } }
  const newState = merge(state, { deep: { arr: { 1: 20 } } })
  t.not(newState.deep, state.deep)
  t.not(newState.deep.arr, state.deep.arr)
  t.deepEqual(newState.deep.arr, [1, 20, 3])
  t.deepEqual(state.deep.arr, [1, 2, 3])
})

test('top level SUB', t => {
  const state = { age: 20, foo: 'bar' }
  const replacement = { replaced: true }
  const newState = merge(state, () => replacement)
  t.not(newState, state)
  t.is(newState, replacement)
})
test('reuse object if same ref when patching', t => {
  const state = { deep: { prop: true } }
  const newState = merge(state, { deep: state.deep })
  t.not(newState, state) // TODO: maybe try and be smarter, to avoid copy if patch changes nothing
  t.is(newState.deep, state.deep)
})

test('assign polyfill works', t => {
  const state = { prop: true, deep: { prop: true, deeper: { foo: 'bar' } } }
  let newState = noAssignMerge(
    state,
    { prop: false, deep: { deeper: { new: true } } },
    false,
    null,
    '',
    0
  )
  t.not(newState, state)
  t.deepEqual(newState, {
    prop: false,
    deep: { prop: true, deeper: { foo: 'bar', new: true } }
  })

  newState = noAssignMerge(void 0, { foo: 'bar' })
  t.deepEqual(newState, { foo: 'bar' })
})

test('multi function patch, only copy once', t => {
  const copies = []
  merge(
    { key: 'value' },
    Array.from({ length: 5 }, () => state => (copies.push(state), state))
  )
  t.is(copies.length, 5)
  t.is(typeof copies[0], 'object')
  copies.every(copy => t.is(copy, copies[0]))
})

test('does not throw error for falsy source', t => {
  const newState = merge(void 0, { foo: 'bar' })
  t.deepEqual(newState, { foo: 'bar' })
})

test('replace primitive with object and vice versa', t => {
  const state = { count: 10, foo: { prop: true } }
  const newState = merge(state, { count: { prop: true }, foo: 10 })
  t.deepEqual(state, { count: 10, foo: { prop: true } })
  t.deepEqual(newState, { count: { prop: true }, foo: 10 })
})
