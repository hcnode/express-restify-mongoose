import { isDistinctExcluded } from './../shared'
import http from 'http'
import APIMethod from '../../APIMethod'
import applyQueryToContext from '../applyQueryToContext'

/**
 * Retrieve a single document based on a request. Use the query and context filter specified in
 * the ERM operation state.
 *
 * @param {ERMOperation} state
 * @param {Object} req
 * @return {Promise<ERMOperation>}
 */
function doGetItem (state, req) {
  if (isDistinctExcluded(state)) {
    return Promise.resolve(
      state.set('result', []).set('statusCode', 200)
    )
  }

  return applyQueryToContext(state.options, state.context, state.query)
    .then(item => {
      if (!item) {
        return Promise.reject(new Error(http.STATUS_CODES[404]))
      }

      return state.set('result', item).set('statusCode', 200)
    })
}

export default new APIMethod(doGetItem)
