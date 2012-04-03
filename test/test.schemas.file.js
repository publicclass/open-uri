var open = require("../lib/open-uri")
  , WriteStream = require('./support/write-stream');

describe('open-uri',function(){

  describe('file',function(){

    it('should read a relative file',function(done){
      open("README.md",function(err,log){
        Buffer.isBuffer(log).should.be.true
        log.should.not.be.empty
        done(err);
      })
    })

    it('should stream an absolute file',function(done){
      var s = new WriteStream(done);
      open('file:///var/log/system.log',s)
    })
  })
})