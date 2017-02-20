'use strict';

module.exports = function getPostMiddlewareForMethod (options, method, statusCode) {
  // HACK: we only need the status code because POST is doing double duty
  // for object creation and modification.
  switch (method.toLowerCase()) {
    case 'get':
      return options.postRead

    case 'post':
      return (statusCode === 201)
        ? options.postCreate
        : options.postUpdate

    case 'put':
    case 'patch':
      return options.postUpdate

    case 'delete':
      return options.postDelete
  }
}
