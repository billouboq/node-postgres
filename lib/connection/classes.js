'use strict'

const DATA_ROW = 'dataRow'

class Message {
  constructor (name, length) {
    this.name = name
    this.length = length
  }
}

class Field {
  constructor () {
    this.name = null
    this.tableID = null
    this.columnID = null
    this.dataTypeID = null
    this.dataTypeSize = null
    this.dataTypeModifier = null
    this.format = null
  }
}

class DataRowMessage {
  constructor (length, fieldCount) {
    this.name = DATA_ROW
    this.length = length
    this.fieldCount = fieldCount
    this.fields = []
  }
}

module.exports = {
  Message,
  Field,
  DataRowMessage
}
