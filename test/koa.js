'use strict'

const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const Router = require('koa-better-router')
const compose = require('koa-compose')
const qs = require('koa-qs')

const createTests = require('./integration/create')
const readTests = require('./integration/read')
const updateTests = require('./integration/update')
const deleteTests = require('./integration/delete')
const accessTests = require('./integration/access')
const contextFilterTests = require('./integration/contextFilter')
const hookTests = require('./integration/hooks')
const middlewareTests = require('./integration/middleware')
const optionsTests = require('./integration/options')
const virtualsTests = require('./integration/virtuals')

const db = require('./integration/setup')()

function KoaApp () {
  let app = new Koa()
  app.use(bodyParser({ enableTypes: ['json'], strict: true }))
  // Must use koa-qs with koa to parse nested queries
  qs(app)
  let router = new Router()
  router.loadMethods()
  app.ermTestRouter = router
  app.ermTestCompose = compose
  app.ermTestIsKoa = true
  app.use(router.middleware())
  return app
}

function setup (callback) {
  db.initialize((err) => {
    if (err) {
      return callback(err)
    }

    db.reset(callback)
  })
}

function dismantle (app, server, callback) {
  db.close((err) => {
    if (err) {
      return callback(err)
    }

    if (app.close) {
      return app.close(callback)
    }

    server.close(callback)
  })
}

function runTests (createFn) {
  describe(createFn.name, () => {
    createTests(createFn, setup, dismantle)
    readTests(createFn, setup, dismantle)
    updateTests(createFn, setup, dismantle)
    deleteTests(createFn, setup, dismantle)
    accessTests(createFn, setup, dismantle)
    contextFilterTests(createFn, setup, dismantle)
    hookTests(createFn, setup, dismantle)
    middlewareTests(createFn, setup, dismantle)
    optionsTests(createFn, setup, dismantle)
    virtualsTests(createFn, setup, dismantle)
  })
}

runTests(KoaApp)
