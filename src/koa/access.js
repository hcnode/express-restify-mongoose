'use strict'

module.exports = function (options) {
  return function access (ctx, next) {
    if (typeof options.access === 'function') {
      return options.access(ctx)
        .then((access) => {
          if (['public', 'private', 'protected'].indexOf(access) < 0) {
            return Promise.reject(new Error('Unsupported access, must be "private", "protected" or "public"'))
          }
          ctx.state.erm.access = access
          return next()
        })
    } else if (Array.isArray(options.access)) {
      ctx.state.erm.access = options.access
      return next()
    } else {
      ctx.state.erm.access = []
      return next()
    }
  }
}
