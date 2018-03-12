'use strict'
/**
 * Copyright (c) 2010-2017 Brian Carlson (brian.m.carlson@gmail.com)
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * README.md file in the root directory of this source tree.
 */

const util = require('util')
const Client = require('./client')
const defaults = require('./connection/defaults')
const Connection = require('./connection')
const Pool = require('pg-pool')
const types = require('pg-types')

const poolFactory = Client => {
  var BoundPool = function (options) {
    var config = Object.assign({ Client: Client }, options)
    return new Pool(config)
  }

  util.inherits(BoundPool, Pool)

  return BoundPool
}

class PG {
  constructor (clientConstructor) {
    this.defaults = defaults
    this.Client = clientConstructor
    this.Query = this.Client.Query
    this.Pool = poolFactory(this.Client)
    this.Connection = Connection
    this.types = types
  }
}

module.exports = new PG(Client)
