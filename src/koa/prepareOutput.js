'use strict'

const debug = require('debug')('erm:koa')
const getPostMiddlewareForMethod = require('../api/shared').getPostMiddlewareForMethod

module.exports = function (options, excludedMap) {
  if (!options.compose) {
    throw new Error('Koa applications must set options.compose to koa-compose module')
  }
  return function prepareOutput (ctx, next) {
    debug(ctx.state._ermReqId + ' prepareOutput')
    const postMiddleware = getPostMiddlewareForMethod(options, ctx.method, ctx.state.erm.statusCode)

    return Promise.resolve()
      .then((resp) => {
        if (postMiddleware) {
          return postMiddleware(ctx)
        } else {
          return Promise.resolve()
        }
      })
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

        return options.outputFn(ctx)
      })
      .then((resp) => {
        if (options.postProcess) {
          return options.compose(options.postProcess)(ctx)
        } else {
          return Promise.resolve()
        }
      })
  }
}
