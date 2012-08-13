var open = require('../');

describe('open-uri',function(){

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
