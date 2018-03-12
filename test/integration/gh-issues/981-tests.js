'use strict'

var helper = require('./../test-helper')
var assert = require('assert')
var pg = require('../../../lib')

var JsClient = require('../../../lib/client')

assert(pg.Client === JsClient)

const jsPool = new pg.Pool()
const suite = new helper.Suite()

suite.test('js pool returns js client', cb => {
  jsPool.connect((err, client, done) => {
    assert(client instanceof JsClient)
    done()
    jsPool.end(cb)
  })
})
