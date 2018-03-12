'use strict'
var helper = require(__dirname + '/../test-helper')
var assert = require('assert')
var ConnectionParameters = require(__dirname + '/../../../lib/connection-parameters')
var defaults = require(__dirname + '/../../../lib').defaults

// clear process.env
for (var key in process.env) {
  delete process.env[key]
}

test('ConnectionParameters construction', function () {
  assert.ok(new ConnectionParameters(), 'with null config')
  assert.ok(new ConnectionParameters({ user: 'asdf' }), 'with config object')
  assert.ok(new ConnectionParameters('postgres://localhost/postgres'), 'with connection string')
})

var compare = function (actual, expected, type) {
  assert.equal(actual.user, expected.user, type + ' user')
  assert.equal(actual.database, expected.database, type + ' database')
  assert.equal(actual.port, expected.port, type + ' port')
  assert.equal(actual.host, expected.host, type + ' host')
  assert.equal(actual.password, expected.password, type + ' password')
  assert.equal(actual.binary, expected.binary, type + ' binary')
  assert.equal(actual.statement_timout, expected.statement_timout, type + ' statement_timeout')
}

test('ConnectionParameters initializing from defaults', function () {
  var subject = new ConnectionParameters()
  compare(subject, defaults, 'defaults')
  assert.ok(subject.isDomainSocket === false)
})

test('ConnectionParameters initializing from defaults with connectionString set', function () {
  var config = {
    user: 'brians-are-the-best',
    database: 'scoobysnacks',
    port: 7777,
    password: 'mypassword',
    host: 'foo.bar.net',
    binary: defaults.binary
  }

  var original_value = defaults.connectionString
  // Just changing this here doesn't actually work because it's no longer in scope when viewed inside of
  // of ConnectionParameters() so we have to pass in the defaults explicitly to test it
  defaults.connectionString = 'postgres://brians-are-the-best:mypassword@foo.bar.net:7777/scoobysnacks'
  var subject = new ConnectionParameters(defaults)
  defaults.connectionString = original_value
  compare(subject, config, 'defaults-connectionString')
})

test('ConnectionParameters initializing from config', function () {
  var config = {
    user: 'brian',
    database: 'home',
    port: 7777,
    password: 'pizza',
    binary: true,
    encoding: 'utf8',
    host: 'yo',
    ssl: {
      asdf: 'blah'
    },
    statement_timeout: 15000
  }
  var subject = new ConnectionParameters(config)
  compare(subject, config, 'config')
  assert.ok(subject.isDomainSocket === false)
})

test('ConnectionParameters initializing from config and config.connectionString', function () {
  var subject1 = new ConnectionParameters({
    connectionString: 'postgres://test@host/db'
  })
  var subject2 = new ConnectionParameters({
    connectionString: 'postgres://test@host/db?ssl=1'
  })
  var subject3 = new ConnectionParameters({
    connectionString: 'postgres://test@host/db',
    ssl: true
  })
  var subject4 = new ConnectionParameters({
    connectionString: 'postgres://test@host/db?ssl=1',
    ssl: false
  })

  assert.equal(subject1.ssl, false)
  assert.equal(subject2.ssl, true)
  assert.equal(subject3.ssl, true)
  assert.equal(subject4.ssl, true)
})

test('escape spaces if present', function () {
  var subject = new ConnectionParameters('postgres://localhost/post gres')
  assert.equal(subject.database, 'post gres')
})

test('do not double escape spaces', function () {
  var subject = new ConnectionParameters('postgres://localhost/post%20gres')
  assert.equal(subject.database, 'post gres')
})

test('initializing with unix domain socket', function () {
  var subject = new ConnectionParameters('/var/run/')
  assert.ok(subject.isDomainSocket)
  assert.equal(subject.host, '/var/run/')
  assert.equal(subject.database, defaults.user)
})

test('initializing with unix domain socket and a specific database, the simple way', function () {
  var subject = new ConnectionParameters('/var/run/ mydb')
  assert.ok(subject.isDomainSocket)
  assert.equal(subject.host, '/var/run/')
  assert.equal(subject.database, 'mydb')
})

test('initializing with unix domain socket, the health way', function () {
  var subject = new ConnectionParameters('socket:/some path/?db=my[db]&encoding=utf8')
  assert.ok(subject.isDomainSocket)
  assert.equal(subject.host, '/some path/')
  assert.equal(subject.database, 'my[db]', 'must to be escaped and unescaped trough "my%5Bdb%5D"')
  assert.equal(subject.client_encoding, 'utf8')
})

test('initializing with unix domain socket, the escaped health way', function () {
  var subject = new ConnectionParameters('socket:/some%20path/?db=my%2Bdb&encoding=utf8')
  assert.ok(subject.isDomainSocket)
  assert.equal(subject.host, '/some path/')
  assert.equal(subject.database, 'my+db')
  assert.equal(subject.client_encoding, 'utf8')
})
