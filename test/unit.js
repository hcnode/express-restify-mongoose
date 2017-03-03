'use strict'

describe('middleware', () => {
  require('./unit/middleware/access')
  require('./unit/middleware/ensureContentType')
  require('./unit/middleware/onError')
  require('./unit/middleware/outputFn')
  require('./unit/middleware/prepareOutput')

  require('./unit/api/prepareQuery')

  require('./unit/buildQuery')
  require('./unit/errorHandler')
  require('./unit/resourceFilter')
  require('./unit/RESTPathGenerator')
  require('./unit/APIMethod')
})

describe.only('koa', () => {
  require('./unit/koa/access')
  require('./unit/koa/ensureContentType')
  require('./unit/koa/onError')
  require('./unit/koa/outputFn')
})

