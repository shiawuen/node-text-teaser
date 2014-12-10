
var debug = require('debug')('textteaser')
var inspect = require('util').inspect
var merge = require('merge')
var path = require('path')
var request = require('superagent')

module.exports = TextTeaser

function TextTeaser(user, subdomain){
  if (false == this instanceof TextTeaser)
    return new TextTeaser(user, subdomain)
  this.wait = 300
  this.user = user
  this.root = 'http://' + (subdomain || 'api') + '.textteaser.com'
  debug('public / dedicated? %s', !!subdomain)
}

TextTeaser.prototype.post = function(data, next){
  var url = this.root + '/post'
  data = merge({ user: this.user }, data)
  debug('sending request to %s', url)
  debug('request data consists %s', Object.keys(data))
  request
    .post(url)
    .type('form')
    .send(data)
    .end(function(err, res){
      if (err) return next(err)
      if (res.status >= 500)
        return next(new Error(res.status + ':' + res.text))
      debug('post response body', res.body)
      next(null, res.body.id)
    })
}

TextTeaser.prototype.get = function get(id, opts, next){
  if ('function' == typeof opts)
    next = opts, opts = {}

  var url = this.root + path.join('/get', this.user, ''+id)
  var tt = this

  debug('sending GET request to %s, with query %s', url, inspect(opts))

  request
    .get(url)
    .query(opts)
    .end(function(err, res){
      if (err) return next(err)
      if (res.status >= 500)
        return next(new Error(res.status + ':' + res.text))

      res.body = res.body || {}

      var hasContent = true
      hasContent &= !!Object.keys(res.body).length
      hasContent &= res.body.status && 'pending' != res.body.status.toLowerCase()

      if (hasContent) return next(null, res.body)

      // summarization not ready yet
      var getAgain = get.bind(tt)
      setTimeout(function(){
        getAgain(id, opts, next)
      }, this.wait)
    })
}

