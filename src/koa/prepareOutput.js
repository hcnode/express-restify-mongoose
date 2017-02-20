'use strict';

const compose = require('koa-compose');
const getPostMiddlewareForMethod = require('../api/getPostMiddlewareForMethod');

module.exports = function (options) {

  return function prepareOutput (ctx, next) {

    let postMiddleware = getPostMiddlewareForMethod(options, ctx.method, ctx.state.erm.statusCode) || []

    return compose(postMiddleware)(ctx)
      .then(() => {
        if (options.totalCountHeader && ctx.state.erm.totalCount) {
          const headerName = (typeof options.totalCountHeader === 'string')
            ? options.totalCountHeader
            : 'X-Total-Count';
          ctx.response.header[headerName] = ctx.state.erm.totalCount;
        }

        let promiseOutputFn = options.outputFn;
        if (options.outputFn.length < 2) {
          promiseOutputFn = function (ctx) {
            options.outputFn(ctx);
            return Promise.resolve();
          }
        }

        return promiseOutputFn(ctx);
      })
      .then((resp) => {
        return options.postProcess ? compose(options.postProcess)(ctx) : Promise.resolve();
      })
      .then((resp) => {
        return next();
      })
  }

};
