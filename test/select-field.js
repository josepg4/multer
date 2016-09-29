/* eslint-env mocha */

var assert = require('assert')

var util = require('./_util')
var multer = require('../')
var FormData = require('form-data')

function generateForm () {
  var form = new FormData()

  form.append('CA$|-|', util.file('empty.dat'))
  form.append('set-1', util.file('tiny0.dat'))
  form.append('set-1', util.file('empty.dat'))
  form.append('set-1', util.file('tiny1.dat'))
  form.append('set-2', util.file('tiny1.dat'))
  form.append('set-2', util.file('tiny0.dat'))
  form.append('set-2', util.file('empty.dat'))

  return form
}

function assertSet (files, setName, fileNames) {
  var len = fileNames.length

  assert.equal(files.length, len)

  for (var i = 0; i < len; i++) {
    assert.equal(files[i].fieldName, setName)
    assert.equal(files[i].originalName, fileNames[i])
  }
}

function assertStreamSizes (files) {
  return Promise.all([
    util.assertStreamSize(files['CA$|-|'][0].stream, 0),
    util.assertStreamSize(files['set-1'][0].stream, 122),
    util.assertStreamSize(files['set-1'][1].stream, 0),
    util.assertStreamSize(files['set-1'][2].stream, 7),
    util.assertStreamSize(files['set-2'][0].stream, 7),
    util.assertStreamSize(files['set-2'][1].stream, 122),
    util.assertStreamSize(files['set-2'][2].stream, 0)
  ])
}

describe('Select Field', function () {
  var parser

  before(function () {
    parser = multer().fields([
      { name: 'CA$|-|', maxCount: 1 },
      { name: 'set-1', maxCount: 3 },
      { name: 'set-2', maxCount: 3 }
    ])
  })

  it('should select the first file with fieldname', function () {
    return util.submitForm(parser, generateForm()).then(function (req) {
      var file

      file = req.files['CA$|-|'][0]
      assert.equal(file.fieldName, 'CA$|-|')
      assert.equal(file.originalName, 'empty.dat')

      file = req.files['set-1'][0]
      assert.equal(file.fieldName, 'set-1')
      assert.equal(file.originalName, 'tiny0.dat')

      file = req.files['set-2'][0]
      assert.equal(file.fieldName, 'set-2')
      assert.equal(file.originalName, 'tiny1.dat')

      return assertStreamSizes(req.files)
    })
  })

  it('should select all files with fieldname', function () {
    return util.submitForm(parser, generateForm()).then(function (req) {
      assertSet(req.files['CA$|-|'], 'CA$|-|', [ 'empty.dat' ])
      assertSet(req.files['set-1'], 'set-1', [ 'tiny0.dat', 'empty.dat', 'tiny1.dat' ])
      assertSet(req.files['set-2'], 'set-2', [ 'tiny1.dat', 'tiny0.dat', 'empty.dat' ])

      return assertStreamSizes(req.files)
    })
  })
})
