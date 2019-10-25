# Mergerino [![npm](https://img.shields.io/npm/v/mergerino.svg)](https://www.npmjs.com/package/mergerino) [![size](https://img.badgesize.io/https://unpkg.com/mergerino@latest/dist/mergerino.min.js.png?label=gzip&color=blue&compression=gzip)](https://unpkg.com/mergerino@latest/dist/mergerino.min.js)

An immutable merge util for state management.

Mergerino works very well with the [meiosis](http://meiosis.js.org/) state management pattern and is offered as a [setup option](https://github.com/foxdonut/meiosis/tree/master/helpers/setup#mergerino-setup).

[Click here to see available builds of mergerino on npm](https://unpkg.com/mergerino/dist/).

## ESM installation

```js
import merge from 'https://unpkg.com/mergerino?module'

const state = {
  user: {
    name: 'John',
    weight: 180,
    age: 34,
    height: 177
  },
  other: {
    many: true,
    properties: true
  }
}
const newState = merge(state, {
  user: {
    name: 'Bob',
    weight: undefined,
    age: age => age / 2
  },
  other: () => ({ replaced: true })
})

/*
result = {
  user: {
    name: 'Bob',
    age: 17,
    height: 177
  },
  other: {
    replaced: true
  }
}
*/
```

[playground](https://flems.io/#0=N4IgZglgNgpgziAXAbVAOwIYFsZJAOgAsAXLKEAGhAGMB7NYmBvEAXwvW10QICsEqdBk2J4IWAA60ATsQAEOaQHMYcsNNpY5AchLEJcRAHojAVzQSA1kvx0sRxSukQ0tAPxZaAE1OxtAHTRAoTh5UIxGOQBeOWBAuTlTOBhpRFj4hLlMHDTtAClaQjRtCgyEgHcYCCUSNIBGAA4ABlK0TLkMFTSAZgAWVvbCKprieoB2MYz2DNpiIdT0tsysDDQATzTiaVMYAcyJDQkU4gh4Te2YKcDWYPpQrJhygGViCNUYxxgACnDGCkWEkkUmk4ksEtkYLkAEK0ABGJTKckq1VqiTQXhgkDQMC8ewSnUhHRU0QAfETVEY5AAmKZ7WbzNJfACUpLkX2AcmkMAkUAw1Bx5x2clYTOuoqCaBCtFg+CgtCUX20MmqLgwUBKcl+MHFUplcoV2gkEWoQy8Guxz1ejCZlBAyVg1BOdzwdUQTTYHBAELwtjgAho9EYzB4bAAuqwgA)

- `state` is left intact
- each part of `state` that your patch instruction touched will be shallow copied into `newState`
- untouched properties retain the same references.

## ES5 browser installation

```html
<script src="https://unpkg.com/mergerino"></script>
<script>
  const state = {
    user: {
      name: 'John',
      weight: 180,
      age: 34,
      height: 177
    },
    other: {
      many: true,
      properties: true
    }
  }
  const newState = mergerino(state, {
    user: {
      name: 'Bob',
      weight: undefined,
      age: function(age) {
        return age / 2
      }
    },
    other: function() {
      return { replaced: true }
    }
  })

  /*
  result = {
    user: {
      name: 'Bob',
      age: 17,
      height: 177
    },
    other: {
      replaced: true
    }
  }
  */
</script>
```

[playground](https://flems.io/#0=N4IgZglgNgpgziAXAbVAOwIYFsZJAOgAsAXLKEAGhAGMB7NYmBvAHjmoCcIAHYgAjgdqAXgA6IEsW5xEAelkBXNNwDWAc3x0ssnBzUwuaWuIB8LWey68TlEHBixqxCPQSIQABkQBWAIwgAXwp0bFx3fAArBCo6BiZiPFi4fmSMRj5hPmBRND4+BXsORCycvLzMHGKAcgApWkI0KopSsoB3GAg1EmLfAA4PZtyyjH1igGYAFkGyvkIOruIegHYllqCW2mI5opKhvKwMNABPYuIOBRhpsu4OWm4DZ3hT85g1nICcpP40GFaAZWIaRgGT4un0hloAApUowKLs8gUDMVsns+BUYNUAEK0ABGTRaeXanW6+TQABMYJAfmSrnkRhi+GAlE4XGhIfSAJTwmZ8DgwYgKDi5el8WR8ABMBL4HyG6yGm22xSZaBZ9EhXJRMz5AqFWV5MG4UAw1BgZOeF2lbzQAQ5OU+rlosHwUFoakhVVoXDUEEwUCaAkBjFtKodTpdbqq3DS1DmZP9P3+gZgwcCwRA6Lwmjg0Ro9EYzHcgQAugEgA)

## Usage Guide

Mergerino is made up of a single function `merge(target, ...patches)`.

Patches in mergerino are expressed as plain JavaScript objects:

```js
merge(state, { I: { am: { just: { an: 'object' } } } })
```

Mergerino merges immutably meaning that the `target` object will never be mutated (changed). Instead each object along the path your patch specifies will be shallow copied into a new object.

The advantage of this is that patch operations are relatively quick because they only copy the parts of the object that are touched.

This means you can use strict equality (`===`) to determine where an object was changed by a patch operation:

```js
const state = { obj: {} }
const newState = merge(state, { newProp: true })
console.log(state === newState) // false
console.log(state.obj === newState.obj) // true
```

If you want to fully remove a property from an object specify `undefined` as the value.

```js
const state = { deleteMe: true }
const newState = merge(state, { deleteMe: undefined })
console.log(state) // { deleteMe: true }
console.log(newState) // {}
```

Use `null` instead of `undefined` if you don't want the key to be deleted.

If you want to replace a property based on its current value, use a function.

```js
const state = { age: 10, obj: { foo: 'bar' } }
const newState = merge(state, { age: x => x * 2, obj: () => ({ replaced: true }) })
console.log(state) // { age: 10, obj: { foo: 'bar' } }
console.log(newState) // { age: 20, obj: { replaced: true } }
```

If you pass a function it will receive the current value as the first argument and the merge function as the second. The return value will be the replacement. The value you return will bypass merging logic and simply overwrite the property. This is useful when you want to replace an object without merging. If you would like to merge from within a function patch then use the merge function provided as the second argument.

## Multiple Patches

You can pass multiple patches in a single merge call, array arguments will be flattened before processing.

All the following are valid:

```js
merge(state, [{}, {}, {}])
merge(state, {}, {}, {})
merge(state, [[[[{}]]]])
merge(state, [{}], [{}], [{}])
```

Another nice side effect of flattening array arguments is that you can easily add conditions to your patches using nested arrays:

```js
merge(state, [
  { week: 56 },
  state.age < 10 && { child: true },
  state.job === 'programmer' && [
    state.promote && { promoted: true },
    !state.salaryPaid && { schedulePayment: true }
  ]
])
```

If all the above conditions are false (except the job check) the final patch array before flattening will look like this:

```js
patches === [{ week: 56 }, false, [false, false]]
```

Since falsy patches are ignored only `{ week: 56 }` will be merged.

Another option is to use the spread operator to combine multiple patches into one, but it's harder/messier to write conditions using this technique as you can see:

```js
merge(state, {
  { week: 56 },
  ...(state.age < 10 ? { child: true } : {}),
  ...(state.job === 'programmer'
    ? {
        ...(state.promote ? { promoted: true } : {}),
        ...(!state.salaryPaid ? { schedulePayment: true } : {})
      }
    : {})
})
```

## As a reducer

Mergerino can be used as a reducer where patches are fed into a function which is then applied to a central state object. In these cases you may not have a reference to the full state object to base your patch on.

In order to help in this scenario mergerino supports passing a function as a top level patch. This function acts exactly the same as a function passed to a specific property. It receives the full state object as the first argument, the merge function as the second.

```js
// state-manager.js
let state = { count: 10 }
const update = patch => (state = merge(state, patch))

// other.js
update({ newProp: true })
// want to use value of count to patch
update((state, m) => m(state, { double: state.count * 2 }))

// back in state-manager.js
console.log(state) // { count: 10, newProp: true, double: 20 }

// if you don't use the merge function the top level object will be replaced
update(state => ({}))
console.log(state) // {}
```

## Credits

Check out [patchinko](https://github.com/barneycarroll/patchinko) by [Barney Carroll](https://github.com/barneycarroll). It was a huge inspiration for `mergerino`.

It takes a much more explicit approach to signaling patch operations and has some interesting API options.
