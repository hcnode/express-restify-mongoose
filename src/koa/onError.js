'use strict';

const http = require('http')
const serializeError = require('serialize-error')

/**
 *
 * @param options {Object}
 * @param [options.buildErrorResponse] {function} Sync function(ctx,errmserializedErr) to build and return the JSON response object
 * @returns {onError}
 */

module.exports = function (options) {

  return function onError (ctx, next) {

    return next()
      .then(() => {
        return Promise.resolve();
      }, (err) => {

        const serializedErr = serializeError(err)
        delete serializedErr.stack

        if (serializedErr.errors) {
          for (let key in serializedErr.errors) {
            delete serializedErr.errors[key].reason
            delete serializedErr.errors[key].stack
          }
        }

        if (err.message === http.STATUS_CODES[404] || (ctx.params.id && err.path === options.idProperty && err.name === 'CastError')) {
          ctx.state.erm.statusCode = 404
        } else {
          ctx.state.erm.statusCode = ctx.state.erm.statusCode && ctx.state.erm.statusCode >= 400 ? ctx.state.erm.statusCode : 400
        }

        ctx.response.header['Content-Type'] = 'application/json';

        ctx.status = ctx.state.erm.statusCode || 500;
        ctx.body = options.buildErrorResponse ? options.buildErrorResponse(ctx,err,serializedErr) : serializedErr;

      });
  };

};

