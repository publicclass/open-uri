var open = require("../")
  , should = require('should')
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

    it('should send an error',function(done){
      open('/i-dont-exist!', function(err, content){
        err.message.should.include('File Not Found');
        should.not.exist(content);
        done()
      })
    })
  })
})