#!/usr/bin/env node
/* global require, Buffer */
const fss = require('fs')
const fs = fss.promises
const path = require('path')
const zlib = require('zlib')
const Terser = require('terser')
const buble = require('buble')

const input = fss.readFileSync('src/index.js', 'utf8')

const name = 'mergerino'
const srcName = name + '.js'
const outName = name + '.min.js'

const es5SrcName = srcName.replace('js', 'es5.js')
const es5OutName = outName.replace('min', 'es5.min')

const terserOut = Terser.minify(
  { [srcName]: input },
  {
    module: true,
    ecma: 8,
    sourceMap: { filename: outName, url: outName + '.map' }
  }
)

const umdBoiler = `;(function(root, factory) {
  if(typeof define === 'function' && define.amd) define([], factory)
  else if(typeof module === 'object' && module.exports) module.exports = factory()
  else root.${name} = factory()
})(typeof self !== 'undefined' ? self : this, function() {
  'use strict'
  var exports = {}
{{CODE}}
  return exports
})
`

const moduleToBrowser = code =>
  umdBoiler.replace(
    '{{CODE}}',
    code
      .replace(/export\s+(const|let|var)\s+([^\s]+)/gi, '$1 $2 = exports.$2')
      .replace(/export\s+\{([^\}]+)\}/, (_, names) =>
        names
          .split(',')
          .map(name => `exports.${name} = ${name}`)
          .join('\n')
      )
      .replace(/export\s+default\s+([^\s]+)/gi, 'exports = assign($1, exports)')
      .replace(/^/gm, '  ')
  )

const bubleOut = buble.transform(moduleToBrowser(input), {
  modules: false,
  transforms: { dangerousForOf: true }
})
const bubleTerserOut = Terser.minify(
  { [es5SrcName]: bubleOut.code },
  { ecma: 5, sourceMap: { filename: es5OutName, url: es5OutName + '.map' } }
)

const reportDiff = (path, newCode) => {
  if (!fss.existsSync(path)) return
  const beforeSize = fss.statSync(path).size
  const beforeGzip = zlib.gzipSync(fss.readFileSync(path)).byteLength
  const afterSize = newCode.length
  const afterGzip = zlib.gzipSync(Buffer.from(newCode, 'utf-8')).byteLength
  console.log(
    [
      '== ' + path + ' ==',
      'Before: ' + beforeSize + ' (gzip ' + beforeGzip + ')',
      ' After: ' + afterSize + ' (gzip ' + afterGzip + ')',
      '  Diff: ' + (afterSize - beforeSize) + ' (gzip ' + (afterGzip - beforeGzip) + ')',
      ''.padStart(path.length + 6, '='),
      ''
    ].join('\n')
  )
}

fs.mkdir('dist', { recursive: true }).then(() => {
  // copy main source file
  fs.writeFile(path.join('dist', srcName), input)
  fs.writeFile(path.join('dist', es5SrcName), bubleOut.code)

  // write min file and source map
  const outPath = path.join('dist', outName)
  reportDiff(outPath, terserOut.code)
  fs.writeFile(outPath, terserOut.code)
  fs.writeFile(outPath + '.map', terserOut.map)

  // write out transpiled source
  const es5OutPath = path.join('dist', es5OutName)
  reportDiff(es5OutPath, bubleTerserOut.code)
  fs.writeFile(es5OutPath, bubleTerserOut.code)
  fs.writeFile(es5OutPath + '.map', bubleTerserOut.map)
})
