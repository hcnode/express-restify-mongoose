import getErrorHandler from '../errorHandler'
import getPrepareQuery from '../api/prepareQuery'

export default function (options) {
  const prepareQueryAsPromise = getPrepareQuery(options.allowRegex)
  const errorHandler = getErrorHandler(options)

  return function (req, res, next) {
    prepareQueryAsPromise(req.query)
      .then(queryOptions => {
        req._ermQueryOptions = queryOptions
        return next()
      })
      .catch(err => {
        return errorHandler(req, res, next)(err)
      })
  }
};
