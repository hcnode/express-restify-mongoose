'use strict';

// STILL WORKING ON THIS ...

 class Context {

   constructor(ctx,type) {
     this._ctx = ctx;     // express = req, koa = ctx
     this._type = type || 'express';
   }

   isKoa() {
     return this._type === 'koa'
   }

   get reqBody() {
     return this.isKoa() ? this._ctx.request.body : this._ctx.body
   }

   set reqBody(val) {
     if( this.isKoa() ) {
       this._ctx.request.body = val;
     } else {
       this._ctx.body = val;
     }
   }

   get resBody() {
     return this.isKoa() ? this._ctx.response.body : this._ctx.body
   }

   set resBody(val) {
     if( this.isKoa() ) {
       this._ctx.response.body = val;
     } else {
       this._ctx.body = val;
     }
   }

   get erm() {
     return this.isKoa() ? this._ctx.state.erm : this._ctx.erm
   }


 }

 module.exports = Context;