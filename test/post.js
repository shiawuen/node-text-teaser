
var TextTeaser = require('../')
var assert = require('assert')
var data = require('./fixture')

var user = process.env.TEXTTEASER_KEY
if (!user) throw new Error('missing TextTeaser key')

var tt = TextTeaser(user)

describe('#post', function(){
  it('should return id given title and text', function(done){
    tt.post(data, function(err, id){
      assert(!!err === false, 'should not have error')
      assert(!!id, 'should returns an id')
      done()
    })
  })
})