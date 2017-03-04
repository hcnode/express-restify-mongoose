---
layout: default
version: 4
---

## Getting started
------------------

**package.json**

```js
{
  "dependencies": {
    "express-restify-mongoose": "^4.0.0",
    "mongoose": "^4.0.0"
  }
}
```

**From the command line**

```js
npm install express-restify-mongoose --save
```

> While the source and examples are now written in ES2015, the module is transpiled and published as ES5 using Babel and remains fully compatible with Node 0.10 and newer.

### Express 4 app

This snippet...

```js
const express = require('express')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const mongoose = require('mongoose')
const restify = require('express-restify-mongoose')
const app = express()
const router = express.Router()

app.use(bodyParser.json())
app.use(methodOverride())

mongoose.connect('mongodb://localhost:27017/database')

restify.serve(router, mongoose.model('Customer', new mongoose.Schema({
  name: { type: String, required: true },
  comment: { type: String }
})))

app.use(router)

app.listen(3000, () => {
  console.log('Express server listening on port 3000')
})
```

...automatically generates these endpoints.

```
GET http://localhost/api/v1/Customer/count
GET http://localhost/api/v1/Customer
POST http://localhost/api/v1/Customer
DELETE http://localhost/api/v1/Customer

GET http://localhost/api/v1/Customer/:id
GET http://localhost/api/v1/Customer/:id/shallow
PUT http://localhost/api/v1/Customer/:id
POST http://localhost/api/v1/Customer/:id
PATCH http://localhost/api/v1/Customer/:id
DELETE http://localhost/api/v1/Customer/:id
```

### Koa 2 app

This snippet generates the same endpoints as the Express app above.

```js
const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const Router = require('koa-better-router')
const compose = require('koa-compose')
const qs = require('koa-qs')    // Required for nested queries
const mongoose = require('mongoose')

let app = new Koa()
app.use(bodyParser({ enableTypes: ['json'], strict: true }))
qs(app)

mongoose.connect('mongodb://localhost:27017/database')

let router = new Router()
app.use(router.middleware())

app.serve(router, mongoose.model('Customer', new mongoose.Schema({
  name: { type: String, required: true },
  comment: { type: String }
})))

app.listen(3000, () => {
  console.log('Koa server listening on port 3000')
})
```

### Usage with [request](https://www.npmjs.com/package/request)

```js
const request = require('request')

request.get({
  url: '/api/v1/Model',
  qs: {
    query: JSON.stringify({
      $or: [{
        name: '~Another'
      }, {
        $and: [{
          name: '~Product'
        }, {
          price: '<=10'
        }]
      }],
      price: 20
    })
  }
})
```

## Querying
-----------

All the following parameters (sort, skip, limit, query, populate, select and distinct) support the entire mongoose feature set.

> When passing values as objects or arrays in URLs, they must be valid JSON.

### Sort

```
GET /Customer?sort=name
GET /Customer?sort=-name
GET /Customer?sort={"name":1}
GET /Customer?sort={"name":0}
```

### Skip

```
GET /Customer?skip=10
```

### Limit

Only overrides `options.limit` if the queried limit is lower.

```
GET /Customer?limit=10
```

### Query

Supports all operators ($regex, $gt, $gte, $lt, $lte, $ne, etc.) as well as shorthands: ~, >, >=, <, <=, !=

```
GET /Customer?query={"name":"Bob"}
GET /Customer?query={"name":{"$regex":"^(Bob)"}}
GET /Customer?query={"name":"~^(Bob)"}
GET /Customer?query={"age":{"$gt":12}}
GET /Customer?query={"age":">12"}
GET /Customer?query={"age":{"$gte":12}}
GET /Customer?query={"age":">=12"}
GET /Customer?query={"age":{"$lt":12}}
GET /Customer?query={"age":"<12"}
GET /Customer?query={"age":{"$lte":12}}
GET /Customer?query={"age":"<=12"}
GET /Customer?query={"age":{"$ne":12}}
GET /Customer?query={"age":"!=12"}
```

### Populate

Works with create, read and update operations.

```
GET/POST/PUT /Invoices?populate=customer
GET/POST/PUT /Invoices?populate={"path":"customer"}
GET/POST/PUT /Invoices?populate=[{"path":"customer"},{"path":"products"}]
```

### Select

```
GET /Customer?select=name
GET /Customer?select=-name
GET /Customer?select={"name":1}
GET /Customer?select={"name":0}
```

### Distinct

If the field is private or protected and the request does not have appropriate access, an empty array is returned.

```
GET /Customer?distinct=name
```

## Reference
------------

### serve

```js
const uri = restify.serve(router, model[, options])

// uri = '/api/v1/Model'
```

**router**: `express.Router()` instance (Express 4), `app` object (Express 3), `koa-router` object (Koa2) or `server` object (restify)

**model**: mongoose model

**options**: object <span class="label label-primary">type</span><span class="label label-success">default</span><span class="label label-info">version</span>

> When <span class="label label-info">version</span> is unspecified, the feature is available in the initial major release (4.0.0)

- [prefix](#prefix)
- [version](#version)
- [idProperty](#idproperty)
- [restify](#restify)
- [koa](#koa)
- [compose](#compose)
- [name](#name)
- [allowRegex](#allowregex)
- [runValidators](#runvalidators)
- [readPreference](#readpreference)
- [totalCountHeader](#totalcountheader)
- [private](#private)
- [protected](#protected)
- [lean](#lean)
- [findOneAndUpdate](#findoneandupdate)
- [findOneAndRemove](#findoneandremove)
- [preMiddleware](#premiddleware)
- [preCreate](#precreate)
- [preRead](#preread)
- [preUpdate](#preupdate)
- [preDelete](#predelete)
- [access](#access)
- [contextFilter](#contextfilter)
- [postCreate](#postcreate)
- [postRead](#postread)
- [postUpdate](#postupdate)
- [postDelete](#postdelete)
- [outputFn](#outputfn)
- [postProcess](#postprocess)
- [onError](#onerror)
- [resultHandler](#resultHandler)

#### prefix
<span class="label label-primary" title="type">string</span><span class="label label-success" title="default">/api</span>

Path to prefix to the REST endpoint.

#### version
<span class="label label-primary" title="type">string</span><span class="label label-success" title="default">/v1</span>

API version that will be prefixed to the rest path. If prefix or version contains `/:id`, then that will be used as the location to search for the id.

##### Example

Generates `/api/v1/Entities/:id/Model` and `/api/v1/Entities/Model` for all pertinent methods.

```js
version: '/v1/Entities/:id'
```

#### idProperty
<span class="label label-primary" title="type">string</span><span class="label label-success" title="default">_id</span>

`findById` will query on the given property.

#### restify
<span class="label label-primary" title="type">boolean</span><span class="label label-success" title="default">false</span>

Enable support for [restify](https://www.npmjs.com/package/restify) instead of [express](https://www.npmjs.com/package/express).

#### koa
<span class="label label-primary" title="type">boolean</span><span class="label label-success" title="default">false</span>

Enable support for [koa2](https://http://koajs.com/) instead of [express](https://www.npmjs.com/package/express).

#### compose
<span class="label label-primary" title="type">function</span>

Required and only used for koa support. Must reference the koa2 version of the [koa-compose](https://github.com/koajs/compose/tree/next) package.

#### name
<span class="label label-primary" title="type">string</span><span class="label label-success" title="default">model name</span>

Endpoint name

#### allowRegex
<span class="label label-primary" title="type">boolean</span><span class="label label-success" title="default">true</span>

Whether or not regular expressions should be executed. Setting it to `true` will protect against ReDoS, see [issue #195](https://github.com/florianholzapfel/express-restify-mongoose/issues/195) for details.

#### runValidators
<span class="label label-primary" title="type">boolean</span><span class="label label-success" title="default">false</span>

Whether or not mongoose should run schema validators when using `findOneAndUpdate`. For more information, [read the mongoose docs](http://mongoosejs.com/docs/validation.html#update-validators).

#### readPreference
<span class="label label-primary" title="type">string</span><span class="label label-success" title="default">primary</span>

Determines the MongoDB nodes from which to read. For more information, [read the mongoose docs](http://mongoosejs.com/docs/api.html#query_Query-read).

#### totalCountHeader
<span class="label label-primary" title="type">boolean|string</span><span class="label label-success" title="default">false</span>

When `totalCountHeader: true`, execute a count query on `GET /Model` requests ignoring limit and skip and setting the result in the a response header. It can also be set to a string to allow for a custom header. This is useful when it's necessary to know in advance how many matching documents exist.

##### Examples

**Boolean**

```js
totalCountHeader: true
```

Response:

```js
Headers: {
  'X-Total-Count': 5
}
```

**String**

```js
totalCountHeader: 'X-Custom-Count-Header'
```

Response:

```js
Headers: {
  'X-Custom-Count-Header': 5
}
```

#### private
<span class="label label-primary" title="type">array</span>

Array of fields which are only to be returned by queries that have `private` access.

##### Example

Defined in options

```js
private: ['topSecret', 'fields']
```

Defined in mongoose schema

```js
new Schema({
  topSecret: { type: String, access: 'protected' },
  fields: { type: String, access: 'protected' }
})
```

#### protected
<span class="label label-primary" title="type">array</span>

Array of fields which are only to be returned by queries that have `private` or `protected` access.

##### Examples

Defined in options

```js
protected: ['somewhatSecret', 'keys']
```

Defined in mongoose schema

```js
new Schema({
  somewhatSecret: { type: String, access: 'protected' },
  keys: { type: String, access: 'protected' }
})
```

#### lean
<span class="label label-primary" title="type">boolean</span><span class="label label-success" title="default">true</span>

Whether or not mongoose should use `.lean()` to convert results to plain old JavaScript objects. This is bad for performance, but allows returning virtuals, getters and setters.

#### findOneAndUpdate
<span class="label label-primary" title="type">boolean</span><span class="label label-success" title="default">true</span>

Whether to use `.findOneAndUpdate()` or `.findById()` and then `.save()`, allowing document middleware to be called. For more information regarding mongoose middleware, [read the docs](http://mongoosejs.com/docs/middleware.html).

#### findOneAndRemove
<span class="label label-primary" title="type">boolean</span><span class="label label-success" title="default">true</span>

Whether to use `.findOneAndRemove()` or `.findById()` and then `.remove()`, allowing document middleware to be called. For more information regarding mongoose middleware, [read the docs](http://mongoosejs.com/docs/middleware.html).

#### preMiddleware
<span class="label label-primary" title="type">function (req, res, next)</span>
or <span class="label label-primary" title="type">function (ctx, next)</span> (koa)

Middleware that runs before [preCreate](#preCreate), [preRead](#preRead), [preUpdate](#preUpdate) and [preDelete](#preDelete).

##### Express Example

```js
preMiddleware: function (req, res, next) {
  performAsyncLogic((err) => {
    next(err)
  })
}
```
##### Koa Example

```js
preMiddleware: function (ctx, next) {
  return promiseFunction()
    .then(() => {
      return next()
    })
}
```

#### preCreate
<span class="label label-primary" title="type">function (req, res, next)</span>
or <span class="label label-primary" title="type">function (ctx, next)</span> (koa)

Middleware that runs before creating a resource.

##### Express Example

```js
preCreate: function (req, res, next) {
  performAsyncLogic((err) => {
    next(err)
  })
}
```
##### Koa Example

```js
preCreate: function (ctx, next) {
  return promiseFunction()
    .then(() => {
      return next()
    })
}
```

#### preRead
<span class="label label-primary" title="type">function (req, res, next)</span>
or <span class="label label-primary" title="type">function (ctx, next)</span> (koa)

Middleware that runs before reading a resource.

##### Express Example
```js
preRead: function (req, res, next) {
  performAsyncLogic((err) => {
    next(err)
  })
}
```
##### Koa Example

```js
preRead: function (ctx, next) {
  return promiseFunction()
    .then(() => {
      return next()
    })
}
```

#### preUpdate
<span class="label label-primary" title="type">function (req, res, next)</span>

Middleware that runs before updating a resource.

##### Express Example
```js
preUpdate: function (req, res, next) {
  performAsyncLogic((err) => {
    next(err)
  })
}
```
##### Koa Example

```js
preUpdate: function (ctx, next) {
  return promiseFunction()
    .then(() => {
      return next()
    })
}
```

When `findOneAndUpdate: false`, the document is available which is useful for authorization as well as setting values.

##### Express Example

```js
findOneAndUpdate: false,
preUpdate: function (req, res, next) {
  if (req.erm.document.user !== req.user._id) {
    return res.sendStatus(401)
  }

  req.erm.document.set('lastRequestAt', new Date())

  next()
}
```

##### Koa Example

```js
findOneAndUpdate: false,
preUpdate: function (ctx, next) {
  if (ctx.state.erm.document.user !== ctx.state.user._id) {
    return Promise.reject(new Error(401))
  }

  ctx.state.erm.document.set('lastRequestAt', new Date())

  return next()
}
```

#### preDelete
<span class="label label-primary" title="type">function (req, res, next)</span>
or <span class="label label-primary" title="type">function (ctx, next)</span> (koa)

Middleware that runs before deleting a resource.

##### Express Example

```js
preDelete: function (req, res, next) {
  performAsyncLogic((err) => {
    next(err)
  })
}
```

##### Koa Example

```js
preDelete: function (ctx, next) {
  return promiseFunction()
    .then(() => {
      return next()
    })
}
```

When `findOneAndRemove: false`, the document is available which is useful for authorization as well as performing non-destructive removals.

##### Express Example

```js
findOneAndRemove: false,
preDelete: function (req, res, next) {
  if (req.erm.document.user !== req.user._id) {
    return res.sendStatus(401)
  }

  req.erm.document.deletedAt = new Date()
  req.erm.document.save().then(function (doc) {
    res.sendStatus(204)
  }, function (err) {
    options.onError(err, req, res, next)
  })
}
```

##### Koa Example

```js
findOneAndRemove: false,
preDelete: function (ctx, next) {
  if (ctx.state.erm.document.user !== ctx.state.user._id) {
    return Promise.reject(new Error(401))
  }

  ctx.state.erm.document.deletedAt = new Date()
  return ctx.state.erm.document.save()
    .then( (doc) => {
      ctx.status = 204
      return Promise.resolve()
    })
}
```

#### access
<span class="label label-primary" title="type">function (req[, done])</span> or
<span class="label label-primary" title="type">function (ctx)</span> (koa)

Returns, yields or resolves to 'private', 'protected' or 'public'. It is called on GET, POST and PUT requests and filters out the fields defined in [private](#private) and [protected](#protected).

##### Express Examples

Sync

```js
access: function (req) {
  if (req.isAuthenticated()) {
    return req.user.isAdmin ? 'private' : 'protected'
  } else {
    return 'public'
  }
}
```

Async

```js
access: function (req, done) {
  performAsyncLogic(function (err, result) {
    done(err, result ? 'public' : 'private')
  })
}
```

##### Koa Examples

Sync

```js
access: function (ctx) {
  if (ctx.isAuthenticated()) {
    return ctx.state.user.isAdmin ? 'private' : 'protected'
  } else {
    return 'public'
  }
}
```

Async

```js
access: function (ctx) {
  return promiseFunction(ctx)
    .then( (resp) => {
      return Promise.resolve(resp ? 'public' : 'private')
    })
}
```

#### contextFilter
<span class="label label-primary" title="type">function (model, req, done)</span> or
<span class="label label-primary" title="type">function (model, ctx, done)</span> (koa)

Allows request specific filtering.

##### Example

```js
contextFilter: function (model, req, done) {
  done(model.find({
    user: req.user._id
  }))
}
```

#### postCreate
<span class="label label-primary" title="type">function (req, res, next)</span> or
<span class="label label-primary" title="type">function (ctx, next)</span> (koa)

Middleware that runs after successfully creating a resource. The unfiltered document is available on `req.erm.result` or `ctx.state.erm.result` (koa).

##### Express Example

```js
postCreate: function (req, res, next) {
  const result = req.erm.result         // unfiltered document or object
  const statusCode = req.erm.statusCode // 201

  performAsyncLogic((err) => {
    next(err)
  })
}
```

##### Koa Example

```js
postCreate: function (ctx, next) {
  const result = ctx.state.erm.result         // unfiltered document or object
  const statusCode = ctx.state.erm.statusCode // 201

  return promiseLogic()
    .then( () => {
      return next()
  })
}
```

#### postRead
<span class="label label-primary" title="type">function (req, res, next)</span> or
<span class="label label-primary" title="type">function (ctx, next)</span> (koa)

Middleware that runs after successfully reading a resource. The unfiltered document(s), or object(s) when `lean: false`, is available on `req.erm.result` or `ctx.state.erm.result` (koa).

##### Express Example

```js
postRead: function (req, res, next) {
  const result = req.erm.result         // unfiltered document, object or array
  const statusCode = req.erm.statusCode // 200

  performAsyncLogic((err) => {
    next(err)
  })
}
```
##### Koa Example

```js
postRead: function (ctx, next) {
  const result = ctx.state.erm.result         // unfiltered document or object
  const statusCode = ctx.state.erm.statusCode // 201

  return promiseLogic()
    .then( () => {
      return next()
  })
}
```


#### postUpdate
<span class="label label-primary" title="type">function (req, res, next)</span> or
<span class="label label-primary" title="type">function (ctx, next)</span> (koa)

Middleware that runs after successfully updating a resource. The unfiltered document, or object when `lean: false`,
is available on `req.erm.result` or `ctx.state.erm.result` (koa).

##### Express Example
```js
postUpdate: function (req, res, next) {
  const result = req.erm.result         // unfiltered document or object
  const statusCode = req.erm.statusCode // 200

  performAsyncLogic((err) => {
    next(err)
  })
}
```
##### Koa Example

```js
postUpdate: function (ctx, next) {
  const result = ctx.state.erm.result         // unfiltered document or object
  const statusCode = ctx.state.erm.statusCode // 201

  return promiseLogic()
    .then( () => {
      return next()
  })
}
```

#### postDelete
<span class="label label-primary" title="type">function (req, res, next)</span> or
<span class="label label-primary" title="type">function (ctx, next)</span> (koa)

Middleware that runs after successfully deleting a resource.

##### Express Example
```js
postDelete: function (req, res, next) {
  const result = req.erm.result         // undefined
  const statusCode = req.erm.statusCode // 204

  performAsyncLogic((err) => {
    next(err)
  })
}
```
##### Koa Example

```js
postDelete: function (ctx, next) {
  const result = ctx.state.erm.result         // unfiltered document or object
  const statusCode = ctx.state.erm.statusCode // 201

  return promiseLogic()
    .then( () => {
      return next()
  })
}
```

#### outputFn
<span class="label label-primary" title="type">function (req, res)</span> or
<span class="label label-primary" title="type">function (ctx)</span> (koa)

Function used to output the result. The filtered object is available on `req.erm.result` or `ctx.state.erm.result` (koa).

##### Express Example

```js
outputFn: function (req, res) {
  const result = req.erm.result         // filtered object
  const statusCode = req.erm.statusCode // 200 or 201

  res.status(statusCode).json(result)
}
```

##### Koa Example

```js
outputFn: function (ctx) {
  if (ctx.state.erm.result) {
    ctx.body = ctx.state.erm.result
  }
  ctx.status = ctx.state.erm.statusCode || 200
  return Promise.resolve()
}
```

#### postProcess
<span class="label label-primary" title="type">function (req, res, next)</span>

Middleware that is called after output, useful for logging. The filtered object is available on `req.erm.result`.

> Not guaranteed to execute after output if async operations are performed inside `outputFn`
> For Koa, consider using onSuccess for logging.

##### Express Example

```js
postProcess: function (req, res, next) {
  const result = req.erm.result         // filtered object
  const statusCode = req.erm.statusCode // 200 or 201

  console.info(`${req.method} ${req.path} request completed with status code ${statusCode}`)
}
```

#### onError
<span class="label label-primary" title="type">function (err, req, res, next)</span><span class="label label-success" title="default">serialize the entire error, except stack</span>

> Leaving this as default may leak information about your database. Not used with Koa

Function used to output an error.

##### Example

```js
onError: function (err, req, res, next) {
  const statusCode = req.erm.statusCode // 400 or 404

  res.status(statusCode).json({
    message: err.message
  })
}
```

#### resultHandler
<span class="label label-primary" title="type">function (ctx, next)</span><span class="label label-success" title="default">serialize the entire error, except stack</span>

> Leaving this as default may leak information about your database. Used only with Koa.

Middleware that is inserted at the beginning of the middleware stack to handle and output results and errors.

##### Example

```js
resultHandler: function (ctx, next) {
  let t0 = new Date()
  return next()
    .then( () => {
      debug('finished handling route in %s ms', ((new Date()) - t0))
    }, (err) => {
      ctx.response.header['Content-Type'] = 'application/json'
      ctx.status = err.status || 400
      ctx.body =  serializeError(err)
    })
}
```

### defaults

```js
restify.defaults(options)
```

**options**: same as above, sets this object as the defaults for anything served afterwards
