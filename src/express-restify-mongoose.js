import util from 'util'
import _ from 'lodash'
import Filter from './resource_filter'
import RESTPathGenerator from './RESTPathGenerator'
import ERMOperation from './ERMOperation'

import getContext from './api/getContext'
import access from './middleware/access'
import ensureContentType from './middleware/ensureContentType'
import onError from './middleware/onError'
import outputFn from './middleware/outputFn'
import prepareQuery from './middleware/prepareQuery'
import prepareOutput from './middleware/prepareOutput'

import operations from './operations'

let customDefaults = null
let excludedMap = {}

function getDefaults () {
  return _.defaults(_.clone(customDefaults) || {}, {
    prefix: '/api',
    version: '/v1',
    idProperty: '_id',
    findOneAndUpdate: true,
    findOneAndRemove: true,
    lean: true,
    restify: false,
    runValidators: false,
    allowRegex: true,
    private: [],
    protected: []
  })
}

function ensureValueIsArray (value) {
  if (_.isArray(value)) {
    return value
  }

  return value ? [value] : []
}

const restify = function (app, model, opts = {}) {
  let options = {}
  _.assign(options, getDefaults(), opts)

  const ensureContentTypeMiddleware = ensureContentType(options)
  const prepareQueryMiddleware = prepareQuery(options)
  const prepareOutputMiddleware = prepareOutput(options, excludedMap)

  if (!_.isArray(options.private)) {
    throw new Error('"options.private" must be an array of fields')
  }

  if (!_.isArray(options.protected)) {
    throw new Error('"options.protected" must be an array of fields')
  }

  model.schema.eachPath((name, path) => {
    if (path.options.access) {
      switch (path.options.access.toLowerCase()) {
        case 'private':
          options.private.push(name)
          break
        case 'protected':
          options.protected.push(name)
          break
      }
    }
  })

  options.filter = new Filter({
    model,
    excludedMap,
    filteredKeys: {
      private: options.private,
      protected: options.protected
    }
  })

  excludedMap[model.modelName] = options.filter.filteredKeys

  options.preMiddleware = ensureValueIsArray(options.preMiddleware)
  options.preCreate = ensureValueIsArray(options.preCreate)
  options.preRead = ensureValueIsArray(options.preRead)
  options.preUpdate = ensureValueIsArray(options.preUpdate)
  options.preDelete = ensureValueIsArray(options.preDelete)

  if (!options.contextFilter) {
    options.contextFilter = (model, req, done) => done(model)
  }

  options.postCreate = ensureValueIsArray(options.postCreate)
  options.postRead = ensureValueIsArray(options.postRead)
  options.postUpdate = ensureValueIsArray(options.postUpdate)
  options.postDelete = ensureValueIsArray(options.postDelete)

  if (!options.onError) {
    options.onError = onError(!options.restify)
  }

  if (!options.outputFn) {
    options.outputFn = outputFn(!options.restify)
  }

  options.name = options.name || model.modelName

  const initialOperationState = ERMOperation.initialize(model, options, excludedMap)

  const ops = operations(initialOperationState)
  const restPaths = new RESTPathGenerator(options.prefix, options.version, options.name)

  if (_.isUndefined(app.delete)) {
    app.delete = app.del
  }

  app.use((req, res, next) => {
    // At the start of each request, add our initial operation state
    _.merge(req, initialOperationState.serializeToRequest())

    next()
  })

  const accessMiddleware = options.access ? access(options) : []
  const contextMiddleware = getContext.getMiddleware(initialOperationState)

  function deprecatePrepareQuery (text) {
    return util.deprecate(
      prepareQueryMiddleware,
      `express-restify-mongoose: in a future major version, ${text} ` +
      `Use PATCH instead.`
    )
  }

  // Retrieval

  app.get(
    restPaths.allDocuments, prepareQueryMiddleware, options.preMiddleware, contextMiddleware,
    options.preRead, accessMiddleware, ops.getItems,
    prepareOutputMiddleware
  )

  app.get(
    restPaths.allDocumentsCount, prepareQueryMiddleware, options.preMiddleware, contextMiddleware,
    options.preRead, accessMiddleware, ops.getCount,
    prepareOutputMiddleware
  )

  app.get(
    restPaths.singleDocument, prepareQueryMiddleware, options.preMiddleware, contextMiddleware,
    options.preRead, accessMiddleware, ops.getItem,
    prepareOutputMiddleware
  )

  app.get(
    restPaths.singleDocumentShallow, prepareQueryMiddleware, options.preMiddleware, contextMiddleware,
    options.preRead, accessMiddleware, ops.getShallow,
    prepareOutputMiddleware
  )

  // Creation

  app.post(
    restPaths.allDocuments, prepareQueryMiddleware, ensureContentTypeMiddleware, options.preMiddleware,
    options.preCreate, accessMiddleware, ops.createObject,
    prepareOutputMiddleware
  )

  // Modification

  app.post(
    restPaths.singleDocument,
    deprecatePrepareQuery('the POST method to update resources will be removed.'),
    ensureContentTypeMiddleware, options.preMiddleware, contextMiddleware,
    options.preUpdate, accessMiddleware, ops.modifyObject,
    prepareOutputMiddleware
  )

  app.put(
    restPaths.singleDocument,
    deprecatePrepareQuery(`the PUT method will replace rather than update a resource.`),
    ensureContentTypeMiddleware, options.preMiddleware, contextMiddleware,
    options.preUpdate, accessMiddleware, ops.modifyObject,
    prepareOutputMiddleware
  )

  app.patch(
    restPaths.singleDocument,
    prepareQueryMiddleware, ensureContentTypeMiddleware, options.preMiddleware, contextMiddleware,
    options.preUpdate, accessMiddleware, ops.modifyObject,
    prepareOutputMiddleware
  )

  // Deletion

  app.delete(
    restPaths.allDocuments,
    prepareQueryMiddleware, options.preMiddleware, contextMiddleware,
    options.preDelete, ops.deleteItems,
    prepareOutputMiddleware
  )

  app.delete(
    restPaths.singleDocument,
    prepareQueryMiddleware, options.preMiddleware, contextMiddleware,
    options.preDelete, ops.deleteItem,
    prepareOutputMiddleware
  )

  return restPaths.allDocuments
}

function defaults (options) {
  customDefaults = options
}

export {
  defaults,
  restify as serve
}
