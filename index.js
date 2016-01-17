var levelup = require('levelup')
var hash = require('commonform-hash')
var stringify = require('commonform-serialize').stringify
var valid = require('commonform-validate').form
var leveldown = require('leveldown')
var path = require('path')
var fs = require('fs')

var output = process.argv[3]
var level = levelup(process.argv[2], { db: leveldown })

level.createReadStream()
  .on('data', function(entry) {
    if (entry.key.startsWith('forms')) {
      var form = withoutDirections(JSON.parse(entry.value))
      if (valid(form)) {
        var digest = hash(stringify(form))
        fs.writeFileSync(
          path.join(output, digest),
          JSON.stringify(form)) }
      else {
        throw new Error('Invalid form at key "' + entry.key + '"') } } })

function withoutDirections(form) {
  return {
    content: form.content.map(function(element) {
      if (typeof element === 'string') {
        return element }
      else if ('form' in element) {
        var returned = { form: withoutDirections(element.form) }
        if ('conspicuous' in element) {
          returned.conspicuous = 'yes' }
        if ('heading' in element) {
          returned.heading = element.heading }
        return returned }
      else if ('blank' in element) {
        return { blank: '' } }
      else {
        return element } }) } }
