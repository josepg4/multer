var createFileFilter = require('./lib/file-filter')
var createMiddleware = require('./lib/middleware')

function _middleware (limits, fields, fileStrategy) {
  return createMiddleware(function setup () {
    return {
      limits: limits,
      fileFilter: createFileFilter(fields),
      fileStrategy: fileStrategy
    }
  })
}

function Multer (options) {
  this.limits = options.limits
}

Multer.prototype.single = function (name) {
  return _middleware(this.limits, [{ name: name, maxCount: 1 }], 'VALUE')
}

Multer.prototype.array = function (name, maxCount) {
  return _middleware(this.limits, [{ name: name, maxCount: maxCount }], 'ARRAY')
}

Multer.prototype.fields = function (fields) {
  return _middleware(this.limits, fields, 'OBJECT')
}

Multer.prototype.none = function () {
  return _middleware(this.limits, [], 'NONE')
}

Multer.prototype.any = function () {
  function setup () {
    return {
      limits: this.limits,
      fileFilter: function () {},
      fileStrategy: 'ARRAY'
    }
  }

  return createMiddleware(setup.bind(this))
}

function multer (options) {
  if (options === undefined) options = {}
  if (options === null) throw new TypeError('Expected object for arugment "options", got null')
  if (typeof options !== 'object') throw new TypeError('Expected object for arugment "options", got ' + (typeof options))

  return new Multer(options)
}

module.exports = multer
