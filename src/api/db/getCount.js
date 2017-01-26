import APIMethod from '../../APIMethod'
import applyQueryToContext from '../applyQueryToContext'

function doGetCount (state, req) {
  return applyQueryToContext(state.options, state.context.count(), state.query)
    .then(count => {
      return state
        .set('result', { count: count })
        .set('totalCount', count)
        .set('statusCode', 200)
    })
}

export default new APIMethod(doGetCount)
