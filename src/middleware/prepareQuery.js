'use strict'

const PrepareQueryAsPromise = require('../api/prepareQuery')
const ErrorHandler = require('../errorHandler')

module.exports = function (options) {
  const prepareQueryAsPromise = PrepareQueryAsPromise(options.allowRegex)
  const errorHandler = ErrorHandler(options)

  return function (req, res, next) {
    prepareQueryAsPromise(req.query)
      .then((queryOptions) => {
        req._erm = req._erm ? req._erm : {}
        req._erm.queryOptions = queryOptions
        return next()
      })
      .catch(err => {
        return errorHandler(req, res, next)(err)
      })
  }
}
