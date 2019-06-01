# Mergerino [![npm](https://img.shields.io/npm/v/mergerino.svg)](https://www.npmjs.com/package/mergerino) [![size](https://img.badgesize.io/https://unpkg.com/mergerino@latest/dist/mergerino.min.js.png?label=gzip&color=blue&compression=gzip)](https://unpkg.com/mergerino@latest/dist/mergerino.min.js)

An immutable merge util for state management.

Mergerino works very well with the [meiosis](http://meiosis.js.org/) state management pattern and is offered as a [setup option](https://github.com/foxdonut/meiosis/tree/master/helpers/setup#mergerino-setup).

## ESM installation

```js
import merge, { SUB, DEL } from 'https://unpkg.com/mergerino?module'

const state = { user: { name: 'John', age: 34, weight: 180, height: 177 } }
const newState = merge(state, {
  user: {
    name: 'Bob',
    weight: DEL,
    age: SUB(age => age / 2)
  }
})

/*
result = {
  user: {
    name: 'Bob',
    age: 17,
    height: 177
  }
}
*/
```

[playground](https://flems.io/#0=N4IgZglgNgpgziAXAbVAOwIYFsZJAOgAsAXLKEAGhAGMB7NYmBvEAXwvW10QICsEqdBk2J4IWAA60ATsQAEOaQHMYFOcDkBlAKoAhNQBEAogBk5rOWGm0scgOQliEuIgD0rgK5oJAayX46LFdFFWkINFoAfixaABMPWDsAHTQUoTh5DIxGOQBedTkPOBhpRALMHDK7AClaQjQ7NQwVMoBmABY1AHcYCCUSMoBGAA4ABjVCXv7iIYB2WfNzNPoMuTQYLs1ibJg8hRKVAAosxjVgFLlC4tL1C8u1rirdWgAjRrvLnr6BuWMTCg+cmaMDKOl0h2BeQAfECVHJXHIAEwASjurBSrFRqTQ6VosHwUFoSmO21O9iSKUaaw2Wx2yMoIGKsGoxAgKzwg0GiA6bA4IAq3AI1DgAho9EYzB4bAAuqwgA)

- `state` is left intact
- each part of `state` that your patch instruction touched will be shallow copied into `newState`
- untouched properties retain the same references.

## ES5 browser installation

```html
<script src="https://unpkg.com/mergerino"></script>
<script>
  const state = { user: { name: 'John', age: 34, weight: 180, height: 177 } }
  const newState = mergerino(state, {
    user: {
      name: 'Bob',
      weight: mergerino.DEL,
      age: mergerino.SUB(function(age) {
        return age / 2
      })
    }
  })

  /*
  result = {
    user: {
      name: 'Bob',
      age: 17,
      height: 177
    }
  }
  */
</script>
```

[playground](https://flems.io/#0=N4IgZglgNgpgziAXAbVAOwIYFsZJAOgAsAXLKEAGhAGMB7NYmBvAHjmoCcIAHYgAjgdqAXgA6IEsW5xEAelkBXNNwDWAc3x0ssnBzUwuaWuIB8LWey68TlEHBixqxCPQSIQABkQBWAIwgAXwp0bFx3fAArBCo6BiZiPFi4fmSMRj5hPmA+BXsORCy+TBwCgHIAKVpCNFKKPgx9AoBmABY6gHcYCDUSAt8ADg86wi6e4j6Adgm+AJnRNCT+NBh2gGViNJgMvl19Q1oAClTGOuB5vhy8grO0C4vimDKAIVoAI1rzu87u3p2DPYgRnwABEAKIAGQonwuDUefz0BkBtHwqwAqk8DmAlE4XGgDrCAJSFDgwYgKDi3WF8WR8ABMMwJnwC8wCjLQ8yStFg+CgtDURw2Jz4pVE81qRRW602BNs9kczlceAAnIhWoFgiAHnhNHBojR6IxmO5AgBdAJAA)

## Usage Guide

Mergerino is made up a single function `merge(target, ...patches)`, plus 2 helpers `DEL` and `SUB`.

Patches in mergerino are expressed as plain JavaScript objects (POJO):

```js
merge(state, { I: { am: { a: 'POJO' } } })
```

Mergerino is immutable so the `target` object will never be modified by mergerino. Instead each object along the path your patch specifies will be shallow copied into a new object.

The advantage of this is that patch operations are very quick because it only copies the parts of the object that are touched, and you can use strict equality (`===`) to determine where an object was changed by a patch operation:

```js
const state = { obj: {} }
const newState = merge(state, { newProp: true })
console.log(state === newState) // false
console.log(state.obj === newState.obj) // true
```

If you want to fully remove a property from an object you can use `DEL`

```js
const state = { deleteMe: true }
const newState = merge(state, { deleteMe: DEL })
console.log(state) // { deleteMe: true }
console.log(newState) // {}
```

If you want to replace a property based on its current value, or bypass merging logic and fully replace a property you can use `SUB`.

```js
const state = { age: 10, obj: { foo: 'bar' } }
const newState = merge(state, { age: SUB(x => x * 2), obj: SUB({ replaced: true }) })
console.log(state) // { age: 10, obj: { foo: 'bar' } }
console.log(newState) // { age: 20, obj: { replaced: true } }
```

If you pass `SUB` a function it will receive the current value as an argument and the return value will be the replacement. If you directly pass a value to `SUB` it will bypass merging logic and simple overwrite the property (this is mainly useful for objects).

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

Another option is to use the spread operator to combine multiple patches into one, but it's harder/messier to write conditions using this technique:

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

In order to help in this scenario mergerino supports passing a function as a top level patch. This function receives the merge target as an argument and treats the return value as a patch.

```js
// state-manager.js
let state = { count: 10 }
const update = patch => (state = merge(state, patch))

// other.js
update({ newProp: true })
// want to use value of count to patch
update(state => ({ double: state.count * 2 }))

// back in state-manager.js
console.log(state) // { count: 10, newProp: true, double: 20 }
```

## Credits

Heavily inspired by [patchinko](https://github.com/barneycarroll/patchinko) by [Barney Carroll](https://github.com/barneycarroll).
