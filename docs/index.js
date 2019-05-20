// UNPKG
import merge, { SUB, DEL } from 'https://unpkg.com/mergerino?module'

// SOURCE
// import merge, { SUB, DEL } from '../src/index.js'

// ES5 DIST
// import '../dist/mergerino.es5.min.js'
// const merge = mergerino
// const { DEL, SUB } = merge

// ES6 DIST
// import merge, { SUB, DEL } from '../dist/mergerino.min.js'

DEL.toJSON = () => '(DEL)'
const _SUB = SUB()._SUB
const iSUB = run => ({
  _SUB,
  run,
  toJSON: () => 'SUB(' + run + ')'
})

document.body.innerHTML = `
<style>
  #output {
    background-color: #263238;
    padding: 20px;
    border-radius: 8px;
    color: white;
    max-width: min-content;
    margin: 50px auto;
    box-shadow: 0 0 20px 1px rgba(0,0,0,0.5);
  }
  .string { color: #c3e88d; }
  .comment { color: #546e7a; }
  .value { color: #f77669; }
  .braces { color: #fff; }
</style>
<pre id="output"><pre>
`

const output = document.getElementById('output')

let state = {}

const testMerge = patch => {
  state = merge(state, patch)
  console.log(state)
  output.textContent +=
    '\n\n\n// --> patched with ' +
    JSON.stringify(typeof patch === 'function' ? patch.toString().replace(/\s+/g, ' ') : patch) +
    '\n\n' +
    JSON.stringify(state, null, 2)
}

testMerge({ count: 3 })
testMerge({ count: iSUB(x => x ** 3) })
testMerge({ hello: 'world' })
testMerge({ hello: DEL, coords: { x: 1, y: 2, z: 3 } })
testMerge({ coords: { y: 10 } })
testMerge({ hello: { amigo: 'carlos' } })
testMerge({ hello: iSUB({}) })
testMerge(() => ({ functionPath: true }))
testMerge(iSUB({ replace: true }))

output.innerHTML = output.innerHTML
  .trim()
  .replace(/("[^"]*")/g, '<span class="string">$1</span>')
  .replace(/(\/\/.+)/g, '<span class="comment">$1</span>')
  .replace(/(:\s*?)([^{,}]+)/g, '$1<span class="value">$2</span>')
  .replace(/[{}]/g, '<span class="braces">$&</span>')
