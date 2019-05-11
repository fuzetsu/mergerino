# Mergerino [![npm](https://img.shields.io/npm/v/mergerino.svg)](https://www.npmjs.com/package/mergerino) [![size](https://img.badgesize.io/https://unpkg.com/mergerino@latest/dist/mergerino.min.js.png?label=gzip&color=blue&compression=gzip)](https://unpkg.com/mergerino@latest?module)

An immutable merge util for state management.

## ESM module usage

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

## ES5 browser usage

```html
<script src="https://unpkg.com/mergerino"></script>
```

```js
const state = { user: { name: 'John', age: 34, weight: 180, height: 177 } }
const newState = mergerino(state, {
  user: {
    name: 'Bob',
    weight: mergerino.DEL,
    age: mergerino.SUB(function(age) { return age / 2 })
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
[playground](https://flems.io/#0=N4IgZglgNgpgziAXAbVAOwIYFsZJAOgAsAXLKEAGhAGMB7NYmBvAHjmoCcIAHYgAjgdqAXgA6IEsW5xEAelkBXNNwDWAc3x0ssnBzUwuaWuIB8LWey68TlEHBixqxCPQSIQABkQBWAIwgAXwp0bFx3fAArBCo6BiZiPFi4fmSMRj5hPmA+BXsORCy+TBwCgHIAKVpCNFKKPgx9AoBmABY6gHcYCDUSAt8ADg86wi6e4j6Adgm+AJnRNCT+NBh2gGViNJgMvl19Q1oAClTGOuB5vhy8grO0C4vimDKAIVoAI1rzu87u3p2DPYgRnwABEAKIAGQonwuDUefz0BkBtHwqwAqk8DmAlE4XGgDrCAJSFDgwYgKDi3WF8WR8ABMMwJnwC8wCjLQ8yStFg+CgtDURw2Jz4pVE81qRRW602BNs9kczlceAAnIhWoFgiAHnhNHBojR6IxmO5AgBdAJAA)

## Credits

Heavily inspired by [patchinko](https://github.com/barneycarroll/patchinko) by [Barney Carroll](https://github.com/barneycarroll).
