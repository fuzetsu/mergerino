# Mergerino [![npm](https://img.shields.io/npm/v/mergerino.svg)](https://www.npmjs.com/package/mergerino) [![size](https://img.badgesize.io/https://unpkg.com/mergerino@latest.png?label=gzip&color=blue&compression=gzip)](https://unpkg.com/mergerino@latest)

immutable merge for state management

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
result = 
{
  user: {
    name: 'Bob',
    age: 17,
    height: 177
  }
}
*/
```

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
result = 
{
  user: {
    name: 'Bob',
    age: 17,
    height: 177
  }
}
*/
```

## Credits

Heavily inspired by [patchinko](https://github.com/barneycarroll/patchinko) by [Barney Carroll](https://github.com/barneycarroll).
