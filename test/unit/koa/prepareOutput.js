const sinon = require('sinon')
const assert = require('assert')
const _ = require('lodash')
const compose = require('koa-compose')

describe('prepareOutput', () => {
  const prepareOutput = require('../../../lib/koa/prepareOutput')

  let next = sinon.stub().returns(Promise.resolve())
  let outputFn = sinon.stub().returns(Promise.resolve())

  afterEach(() => {
    outputFn.reset()
    next.reset()
  })

  it('calls outputFn with default options and no post* middleware', () => {
    let ctx = {
      method: 'GET',
      state: {
        erm: {
          statusCode: 398
        },
        _ernReqId: 5
      }
    }

    let options = {
      outputFn: outputFn
    }

    return new Promise((resolve, reject) => {
      prepareOutput(options)(ctx, next)
        .then((resp) => {
          sinon.assert.calledOnce(outputFn)
          sinon.assert.calledWithExactly(outputFn, ctx)
          sinon.assert.notCalled(next)
          resolve()
        }, (err) => {
          reject('should not result in error')
        });
    });

  })

  it('calls outputFn with default options and postCreate middleware', () => {
    let ctx = {
      method: 'POST',
      state: {
        erm: {
          statusCode: 201
        },
        _ernReqId: 5
      }
    }

    let postCreate = sinon.stub().returns(Promise.resolve())

    let options = {
      outputFn: outputFn,
      postCreate: compose([postCreate]),
    }

    return new Promise((resolve, reject) => {
      prepareOutput(options)(ctx, next)
        .then((resp) => {
          sinon.assert.calledOnce(postCreate)
          sinon.assert.calledOnce(outputFn)
          sinon.assert.calledWithExactly(outputFn, ctx)
          sinon.assert.notCalled(next)
          resolve()
        }, (err) => {
          reject('should not result in error')
        });
    });
  })

  it('calls outputFn with default options and postRead middleware', () => {
    let ctx = {
      method: 'GET',
      state: {
        erm: {
          statusCode: 200
        },
        _ernReqId: 5
      }
    }

    let postRead = sinon.stub().returns(Promise.resolve())

    let options = {
      outputFn: outputFn,
      postRead: compose([postRead]),
    }

    return new Promise((resolve, reject) => {
      prepareOutput(options)(ctx, next)
        .then((resp) => {
          sinon.assert.calledOnce(postRead)
          sinon.assert.calledOnce(outputFn)
          sinon.assert.calledWithExactly(outputFn, ctx)
          sinon.assert.notCalled(next)
          resolve()
        }, (err) => {
          reject('should not result in error')
        })
    })
  })

  it('calls outputFn with default options and postUpdate middleware', () => {
    let ctx = {
      method: 'POST',
      state: {
        erm: {
          statusCode: 200,
          result: {
            name: 'Bob'
          },
        },
        _ernReqId: 5
      }
    }

    let postUpdate = sinon.stub().returns(Promise.resolve())

    let options = {
      outputFn: outputFn,
      postUpdate: compose([postUpdate]),
    }

    return new Promise((resolve, reject) => {
      prepareOutput(options)(ctx, next)
        .then((resp) => {
          sinon.assert.calledOnce(postUpdate)
          sinon.assert.calledOnce(outputFn)
          sinon.assert.calledWithExactly(outputFn, ctx)
          sinon.assert.notCalled(next)
          resolve()
        }, (err) => {
          reject('should not result in error')
        })
    })
  })

  it('calls outputFn with default options and postUpdate middleware', () => {
    let ctx = {
      method: 'PUT',
      state: {
        erm: {
          statusCode: 200,
          result: {
            name: 'Bob'
          },
        },
        _ernReqId: 5
      }
    }

    let postUpdate = sinon.stub().returns(Promise.resolve())

    let options = {
      outputFn: outputFn,
      postUpdate: compose([postUpdate])
    }

    return new Promise((resolve, reject) => {
      prepareOutput(options)(ctx, next)
        .then((resp) => {
          sinon.assert.calledOnce(postUpdate)
          sinon.assert.calledOnce(outputFn)
          sinon.assert.calledWithExactly(outputFn, ctx)
          sinon.assert.notCalled(next)
          resolve()
        }, (err) => {
          reject('should not result in error')
        })
    })
  })

  it('calls outputFn with default options and postDelete middleware', () => {
    let ctx = {
      method: 'DELETE',
      state: {
        erm: {
          statusCode: 204,
          result: {
            name: 'Bob'
          },
        },
        _ernReqId: 5
      }
    }

    let postDelete = sinon.stub().returns(Promise.resolve())

    let options = {
      outputFn: outputFn,
      postDelete: compose([postDelete])
    }

    return new Promise((resolve, reject) => {
      prepareOutput(options)(ctx, next)
        .then((resp) => {
          sinon.assert.calledOnce(postDelete)
          sinon.assert.calledOnce(outputFn)
          sinon.assert.calledWithExactly(outputFn, ctx)
          sinon.assert.notCalled(next)
          resolve()
        }, (err) => {
          reject('should not result in error')
        })
    })
  })

  it('calls outputFn with default options and bad postRead middleware', () => {
    let ctx = {
      method: 'GET',
      state: {
        erm: {
          statusCode: 200
        },
        _ernReqId: 5
      }
    }

    let postRead = sinon.stub().returns(Promise.reject(new Error('an error occurred')))

    let options = {
      outputFn: outputFn,
      postRead: compose([postRead])
    }

    return new Promise((resolve, reject) => {
      prepareOutput(options)(ctx, next)
        .then((resp) => {
          reject('should result in error')
        }, (err) => {
          sinon.assert.calledOnce(postRead)
          assert(err.message, 'an error occurred')
          sinon.assert.notCalled(outputFn)
          sinon.assert.notCalled(next)
          resolve()
        })
    })
  })

  describe(`asynchronous outputFn`, () => {
    it('calls outputFn -> postProcess if no errors', () => {
      let ctx = {
        method: 'GET',
        state: {
          erm: {
            statusCode: 200
          },
          _ernReqId: 5
        }
      }
      let status = {}

      let options = {
        // Should be called before postProcess
        outputFn: (context) => {
          assert.strictEqual(ctx.method, context.method)
          assert.ok(_.isEmpty(context.state.erm.result))
          status.calledOutput = true
          return Promise.resolve()
        },

        postProcess: (context, next) => {
          assert.ok(status.calledOutput === true)
          status.calledPostProcess = true
          return next()
        }
      }

      return new Promise((resolve, reject) => {
        prepareOutput(options)(ctx, next)
          .then((resp) => {
            resolve()
          }, (err) => {
            assert.ok(status.calledOutput === true)
            assert.ok(status.calledPostProcess === true)
            reject('should not result in error')
          })
      })
    })


    it(`outputFn errors are handled`, () => {
      let ctx = {
        method: 'GET',
        state: {
          erm: {
            statusCode: 200
          },
          _ernReqId: 5
        }
      }
      const outputError = new Error('outputFn error')
      const options = {
        outputFn: (ctx) => {
          return Promise.reject(outputError)
        },
        postProcess: _.noop
      }

      return new Promise((resolve, reject) => {
        prepareOutput(options)(ctx, next)
          .then((resp) => {
            reject('should result in error')
          }, (err) => {
            assert(err.message, outputError.message)
            sinon.assert.notCalled(next)
            resolve()
          })
      })
    })

    it(`postProcess errors are handled`, () => {
      let ctx = {
        method: 'GET',
        state: {
          erm: {
            statusCode: 200
          },
          _ernReqId: 5
        }
      }
      const postProcessError = new Error('postProcess error')
      const options = {
        postProcess: (ctx) => {
          return Promise.reject(postProcessError)
        }
      }

      return new Promise((resolve, reject) => {
        prepareOutput(options)(ctx, next)
          .then((resp) => {
            reject('should result in error')
          }, (err) => {
            assert(err.message, postProcessError.message)
            sinon.assert.notCalled(next)
            resolve()
          })
      })
    })
  })
})
