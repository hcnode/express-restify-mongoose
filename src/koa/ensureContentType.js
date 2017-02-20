'use strict'

module.exports = function (options) {
  return function ensureContentType (ctx, next) {
    const ct = ctx.request.headers['content-type']
    if (!ct) {
      return Promise.reject(new Error('missing_content_type'))
    }

    if (ct.indexOf('application/json') === -1) {
      return Promise.reject(new Error('invalid_content_type'))
    }

    return next()
  }
}
