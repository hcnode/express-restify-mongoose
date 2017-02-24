'use strict'

module.exports = function (options) {
  const prepareQueryAsPromise = require('../api/prepareQuery')(options.allowRegex)

  return function (ctx, next) {
    prepareQueryAsPromise(ctx.request.query)
      .then(queryOptions => {
        ctx.state._erm.queryOptions = queryOptions
        return next()
      })
  }
}
