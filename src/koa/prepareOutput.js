'use strict'

const debug = require('debug')('erm:koa')
const getPostMiddlewareForMethod = require('../api/shared').getPostMiddlewareForMethod


module.exports = function (options, excludedMap) {

  function execMiddleware (fn, ctx, next) {
    if (Array.isArray(fn)) {
      return fn.length ? options.compose(fn)(ctx, next) : Promise.resolve()
    } else if (fn) {
      return fn(ctx, next)
    }
    return Promise.resolve()
  }

  return function prepareOutput (ctx, next) {
    debug(ctx.state._ermReqId + ' prepareOutput')
    let postMiddleware = getPostMiddlewareForMethod(options, ctx.method, ctx.state.erm.statusCode)

    return execMiddleware(postMiddleware, ctx)
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
          ctx.set(headerName, ctx.state.erm.totalCount)
        }

        return options.outputFn(ctx)
      })
      .then((resp) => {
        return execMiddleware(options.postProcess, ctx, next)
      })
  }
}
