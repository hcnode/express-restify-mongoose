'use strict'
const debug = require('debug')('erm:koa')

module.exports = function (options) {
  const prepareQueryAsPromise = require('../api/prepareQuery')(options.allowRegex)

  return function (ctx, next) {
    debug('%s prepareQuery %s', ctx.reqId, JSON.stringify(ctx.request.query))
    return prepareQueryAsPromise(ctx.request.query)
      .then(queryOptions => {
        ctx.state._erm.queryOptions = queryOptions
        return next()
      })
  }
}
