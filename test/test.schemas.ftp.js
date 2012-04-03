var open = require("../lib/open-uri")
  , WriteStream = require('./support/write-stream')
  , fs = require("fs");

describe('open-uri',function(){

  describe('ftp',function(){

    it('should GET a text file from ftp',function(done){
      open("ftp://ftp.sunet.se/pub/Internet-documents/rfc/rfc100.txt",function(err,rfc){
        rfc.should.be.a('string')
        rfc.should.not.be.empty
        done(err)
      })
    })

    it('should attempt to get a non-existing text file from ftp',function(done){
      open("ftp://ftp.sunet.se/im-not-here.txt",function(err,rfc){
        err.should.exist
        // rfc.should.be.undefined ?
        done()
      })
    })

    it('should stream a text file from ftp',function(done){
      open("ftp://ftp.sunet.se/pub/Internet-documents/rfc/rfc100.txt",new WriteStream(done))
    })

    it('should stream a text file from ftp to a file',function(done){
      var path = "/tmp/rfc-"+Date.now()+".html";
      var file = fs.createWriteStream(path)
      open("ftp://ftp.sunet.se/pub/Internet-documents/rfc/rfc100.txt",file)
      file.on('end',function(){
        (function(){fs.statSync(path)}).should.not.throw
        done();
      })
    })

  })

})