var open = require("../lib/open-uri");

describe('open-uri',function(){

  it('should be a Stream',function(){
    open('/var/log/system.log').should.be.an.instanceof(require('stream'));
  })

  it('should throw when error and no callback',function(){
    (function(){
      open('/i-dont-exist!')
    }).should.throw
  })

  it('should not throw when error and callback',function(){
    (function(){
      open('/i-dont-exist!',function(err){
        err.should.exist
      })
    }).should.not.throw
  })
})
