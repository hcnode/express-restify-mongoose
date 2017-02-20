'use strict';

const http = require('http');

module.exports = function (model, options) {

  return function filterAndFindById (ctx, next) {

    if (!ctx.params.id) {
      return next();
    }
    // Get the module context and the query options
    let krm = ctx.state.krm;

    // Apply a context filter first, if it exists
    return options.contextFilter(model)
      .then((filteredContext) => {
        let byId = {};
        byId[options.idProperty] = ctx.params.id;
        return filteredContext.findOne().and(byId).lean(false).read(options.readPreference);
      })
      .then((doc) => {
        if (doc) {
          krm.document = doc;
          return next();
        } else {
          let err = new Error(http.STATUS_CODES[404]);
          err.statusCode = 404;
          return Promise.reject(err);
        }
      });
  }
}
