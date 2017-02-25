'use strict'

const getPostMiddlewareForMethod = require('../api/shared').getPostMiddlewareForMethod

module.exports = function (options, excludedMap) {
  if (!options.compose) {
    throw new Error('Koa applications must set options.compose to koa-compose module')
  }
  return function prepareOutput (ctx, next) {
    let postMiddleware = getPostMiddlewareForMethod(options, ctx.method, ctx.state.erm.statusCode) || []

    return options.compose(postMiddleware)(ctx)
      .then(() => {
        // TODO: this will, but should not, filter /count queries
        if (ctx.state.erm.result && options.filter) {
          let opts = {
            access: ctx.state._erm.access,
            excludedMap: excludedMap,
            populate: ctx.state._erm.queryOptions
              ? ctx.state._erm.queryOptions.populate
              : null
          }

          ctx.state.erm.result = options.filter.filterObject(ctx.state.erm.result, opts)
        }

        if (options.totalCountHeader && ctx.state.erm.totalCount) {
          const headerName = (typeof options.totalCountHeader === 'string')
            ? options.totalCountHeader
            : 'X-Total-Count'
          ctx.response.header[headerName] = ctx.state.erm.totalCount
        }

        let promiseOutputFn = options.outputFn
        if (options.outputFn.length < 2) {
          promiseOutputFn = function (ctx) {
            options.outputFn(ctx)
            return Promise.resolve()
          }
        }

        return promiseOutputFn(ctx)
      })
      .then((resp) => {
        if (options.postProcess) {
          return options.compose(options.postProcess)(ctx)
        } else {
          return Promise.resolve()
        }
      })
      .then((resp) => {
        return next()
      })
  }
}
