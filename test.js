#!/usr/bin/env node
/* global require */
const o = require('ospec')

const depPath = './dist/mergerino.es5.js'
const merge = require(depPath)

// create version that uses assign polyfill
const save = Object.assign
Object.assign = null
delete require.cache[require.resolve(depPath)]
const noAssignMerge = require(depPath)
Object.assign = save

o.spec('mergerino', () => {
  o('DEL works', () => {
    const state = { prop: true, other: true, deep: { prop: 'foo' } }
    const newState = merge(state, { prop: merge.DEL, deep: { prop: merge.DEL } })
    o(newState).deepEquals({ other: true, deep: {} })
    o(state).deepEquals({ prop: true, other: true, deep: { prop: 'foo' } })
  })
  o('SUB works', () => {
    const state = { age: 10, name: 'bob', obj: { prop: true } }
    const newState = merge(state, {
      age: merge.SUB(x => x * 10),
      obj: merge.SUB({ replaced: true })
    })
    o(newState).deepEquals({ age: 100, name: 'bob', obj: { replaced: true } })
    o(state).deepEquals({ age: 10, name: 'bob', obj: { prop: true } })
  })
  o('add new sub object', () => {
    const state = { age: 10 }
    const add = { sub: true }
    const newState = merge(state, { add })
    o(newState).deepEquals({ age: 10, add: { sub: true } })
    o(newState.add).equals(add) // TODO: should it work like this?
    o(newState).notEquals(state)
  })
  o('deep merge objects', () => {
    const state = { age: 10, sub: { sub: { prop: true } } }
    const newState = merge(state, { sub: { sub: { newProp: true } } })
    o(state).deepEquals({ age: 10, sub: { sub: { prop: true } } })
    o(newState).deepEquals({ age: 10, sub: { sub: { prop: true, newProp: true } } })
    o(newState).notEquals(state)
    o(newState.sub).notEquals(state.sub)
    o(newState.sub.sub).notEquals(state.sub.sub)
  })
  o('function patch', () => {
    const state = { age: 10, foo: 'bar' }
    const newState = merge(state, s => {
      o(s).notEquals(state)
      o(s).deepEquals(state)
      return { prop: true }
    })
    o(newState).deepEquals({ age: 10, foo: 'bar', prop: true })
  })
  o('multi/array/falsy patches', () => {
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
      () => ({ age: 10 }),
      [[[[[[[{ age: merge.SUB(x => x * 3) }]]]]]]]
    )
    o(newState).notEquals(state)
    o(state).deepEquals({ foo: 'bar' })
    o(newState).deepEquals({
      foo: 'bar',
      baz: 5,
      prop: true,
      hello: false,
      arr: [1, 2, 3],
      age: 30
    })
  })
  o('array patches', () => {
    const arr = [1, 2, 3]
    const newArr = merge(arr, { 2: 100 }, { 0: merge.DEL }, { 0: 200 })
    o(newArr).notEquals(arr)
    o(newArr).deepEquals([200, 100])
    o(arr).deepEquals([1, 2, 3])
  })
  o('deep merge with arr', () => {
    const state = { foo: 'bar', deep: { arr: [1, 2, 3], prop: false } }
    const newState = merge(state, { deep: { arr: { 1: 20 } } })
    o(newState.deep).notEquals(state.deep)
    o(newState.deep.arr).notEquals(state.deep.arr)
    o(newState.deep.arr).deepEquals([1, 20, 3])
    o(state.deep.arr).deepEquals([1, 2, 3])
  })
  o('top level SUB', () => {
    const state = { age: 20, foo: 'bar' }
    const replacement = { replaced: true }
    const newState = merge(state, merge.SUB(replacement))
    o(newState).notEquals(state)
    o(newState).equals(replacement)
  })
  o('top level SUB from function patch', () => {
    const state = { age: 20, foo: 'bar' }
    const replacement = { replaced: true }
    const newState = merge(state, () => merge.SUB(replacement))
    o(newState).notEquals(state)
    o(newState).equals(replacement)
  })
  o('reuse object if same ref when patching', () => {
    const state = { deep: { prop: true } }
    const newState = merge(state, { deep: state.deep })
    o(newState).notEquals(state) // TODO: maybe try and be smarter, to avoid copy if patch changes nothing
    o(newState.deep).equals(state.deep)
  })
  o('assign polyfill works', () => {
    const state = { prop: true, deep: { prop: true, deeper: { foo: 'bar' } } }
    const newState = noAssignMerge(state, { prop: false, deep: { deeper: { new: true } } })
    o(newState).notEquals(state)
    o(newState).deepEquals({ prop: false, deep: { prop: true, deeper: { foo: 'bar', new: true } } })
  })
})