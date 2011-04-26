var open = require("../lib/open-uri")
  , assert = require("assert")
  , Stream = require("stream").Stream;

function writeStream(){
  var stream = new Stream();
  stream.written = false;
  stream.ended = false;
  stream.writable = true;
  stream.write = function(d){stream.written = true};
  stream.end = function(d){stream.ended = true};
  return stream;
}

exports["Get a website"] = function(beforeExit){
  var loaded = false;
  open("http://google.com",function(err,google){
    loaded = true;
    assert.ifError(err)
    assert.type(google,"string")
    assert.ok(google.length>0)
  })
  beforeExit(function(){assert.ok(loaded)})
}

exports["Get a relative file"] = function(beforeExit){
  var loaded = false;
  open("README.md",function(err,log){  
    loaded = true;
    assert.ifError(err)
    assert.type(log.toString(),"string")
    assert.ok(log.length>0)
  })
  beforeExit(function(){assert.ok(loaded)})
}

exports["Stream an absolute file"] = function(beforeExit){
  var stream = writeStream();
  open("file:///var/log/system.log",stream)
  beforeExit(function(){
    assert.ok(stream.written)
    assert.ok(stream.ended)
  })
}
 
exports["Stream a website to a file"] = function(beforeExit){
  var path = "/tmp/goog-"+Date.now()+".html";
  var file = require("fs").createWriteStream(path)
  open("https://encrypted.google.com/search?q=open+uri",file)
  beforeExit(function(){
    assert.doesNotThrow(function(){
      require("fs").statSync(path)
    })
  })
}

exports["Get a text file from ftp"] = function(beforeExit){
  var loaded = false;
  open("ftp://ftp.sunet.se/pub/Internet-documents/rfc/rfc100.txt",function(err,rfc){
    loaded = true
    assert.ifError(err)
    assert.type(rfc,"string")
    assert.ok(rfc.length > 0)
  })
  beforeExit(function(){assert.ok(loaded)})
}

exports["Attempt to get a non-existing text file from ftp"] = function(beforeExit){
  var loaded = false;
  open("ftp://ftp.sunet.se/im-not-here.txt",function(err,rfc){
    loaded = true
    assert.ok(err)
    assert.type(rfc,"undefined")
  })
  beforeExit(function(){assert.ok(loaded)})
}

exports["Stream a text file from ftp to a file"] = function(beforeExit){
  var path = "/tmp/rfc-"+Date.now()+".html";
  var file = require("fs").createWriteStream(path)
  open("ftp://ftp.sunet.se/pub/Internet-documents/rfc/rfc100.txt",file)
  beforeExit(function(){
    assert.doesNotThrow(function(){
      require("fs").statSync(path)
    })
  })
}

exports["Chain it"] = function(beforeExit){
  var stream = writeStream();
  var loaded = false;
  open("http://google.com",stream)("file:///var/log/system.log",function(err,google){
    loaded = true;
    assert.type(google.toString(),"string")
    assert.ok(google.length>0)
  })
  beforeExit(function(){
    assert.ok(loaded)
    assert.ok(stream.written)
    assert.ok(stream.ended)
  })
}

exports["Throw when error without callback."] = function(){
  assert.throws(function(){
    open("/i-dont-exist!")
  })
}

exports["Does not throw when error with a callback."] = function(){
  assert.doesNotThrow(function(){
    open("/i-dont-exist!",function(err){ assert.ok(err) })
  })
}