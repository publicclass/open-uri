var open = require("../lib/open-uri")
  , echo = require('./support/echo-server')
  , fs = require("fs");

describe('open-uri',function(){
  describe('https',function(){

    it('should GET an encrypted website',function(done){
      open("https://github.com",function(err,github){
        github.should.be.a('string')
        github.should.not.be.empty
        done(err);
      })
    })

    it('should GET a website with auth',function(done){
      open("http://user:pass@google.com",function(err,google){
        google.should.be.a('string')
        google.should.not.be.empty
        done(err);
      })
    })

    it('should GET Stream an encrypted website to a file',function(done){
      var path = "/tmp/goog-"+Date.now()+".html";
      var file = fs.createWriteStream(path)
      open("https://encrypted.google.com/search?q=open+uri",file);
      file.on('close',function(){
        (function(){fs.statSync(path)}).should.not.throw
        done();
      })
    })

    it('should GET a website that accepts gzip',function(done){
      open("https://github.com",function(err,sunet,res){
        res.should.have.status(200)
        res.should.have.header('content-encoding','gzip')
        sunet.should.be.a('string')
        sunet.should.not.be.empty
        done(err);
      })
    })

  })
})