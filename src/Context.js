'use strict';

// STILL WORKING ON THIS ...

class Context {

  constructor (ctx) {
    this._ctx = ctx;     // express = { request: req, response: res }, koa = ctx
  }

  get body () {
    return this._ctx.request.body;
  }

}

class KoaContext extends Context {

  constructor (ctx) {
    super(ctx);
  }

  set body (val) {
    this._ctx.request.body = val;
  }

  get erm() {
    return this._ctx.state.erm;
  }

}

class ExpressContext extends Context {

  constructor (ctx) {
    super(ctx);
  }

  set body (val) {
    this._ctx.body = val;
  }

  get erm() {
    return this._ctx.request.erm;
  }

}

module.exports = {
  KoaContext: KoaContext,
  ExpressContext: ExpressContext
};