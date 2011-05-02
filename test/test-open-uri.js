var open = require("../lib/open-uri")
  , assert = require("assert")
  , Stream = require("stream").Stream
  , port = 65000;

function writeStream(){
  var stream = new Stream();
  stream.written = false;
  stream.ended = false;
  stream.writable = true;
  stream.write = function(d){stream.written = true};
  stream.end = function(d){stream.ended = true};
  return stream;
}

// A simple test echo server
function echo(port,fn){
  var http = require("http").createServer(function(req,res){
    res.writeHead(200, {
      'Content-Type': req.headers["content-type"] || 'text/plain',
      'Content-Length': req.headers["content-length"]
    })
    req.pipe(res)
  })
  http.listen(port,function(){fn(http)})
}

exports["GET a website"] = function(beforeExit){
  var loaded = false;
  open("http://google.com",function(err,google){
    loaded = true;
    assert.ifError(err)
    assert.type(google,"string")
    assert.ok(google.length>0)
  })
  beforeExit(function(){assert.ok(loaded)})
}

exports["GET an encrypted website"] = function(beforeExit){
  var loaded = false;
  open("https://github.com",function(err,github){
    loaded = true;
    assert.ifError(err)
    assert.type(github,"string")
    assert.ok(github.length>0)
  })
  beforeExit(function(){assert.ok(loaded)})
}

exports["POST a string to a website"] = function(){
  echo(++port,function(server){
    open("http://localhost:"+port,{method:"POST",body:"abc"},function(err,dump,res){
      server.close()
      assert.ifError(err)
      assert.equal(res.headers["content-type"],"text/plain")
      assert.equal(dump.toString(),"abc")
    })
  })
}

exports["POST a buffer to a website"] = function(){
  echo(++port,function(server){
    open("http://localhost:"+port,{method:"POST",body:new Buffer([1,2,3,4]),headers:{"Content-Type":"application/octet-stream"}},function(err,dump,res){
      server.close()
      assert.ifError(err)
      assert.equal(res.headers["content-type"],"application/octet-stream")
      assert.ok(Buffer.isBuffer(dump))
      assert.equal(dump.length,4)
    })
  })
}

exports["PUT a form to a website"] = function(){
  echo(++port,function(server){
    open("http://localhost:"+port,{method:"POST",body:"a=1&b=2&c=3",headers:{"Content-Type":"application/x-www-form-urlencoded"}},function(err,dump,res){
      server.close()
      assert.ifError(err)
      assert.equal(res.headers["content-type"],"application/x-www-form-urlencoded")
      assert.type(dump,"object")
      assert.eql(dump,{a:1,b:2,c:3})
    })
  })
}

exports["POST some json to a website"] = function(){
  echo(++port,function(server){
    open("http://localhost:"+port,{method:"POST",body:'{"a":1,"b":2,"c":3}',headers:{"Content-Type":"application/json"}},function(err,dump,res){
      server.close()
      assert.ifError(err)
      assert.equal(res.headers["content-type"],"application/json")
      assert.type(dump,"object")
      assert.eql(dump,{a:1,b:2,c:3})
    })
  })
}
exports["GET a relative file"] = function(beforeExit){
  var loaded = false;
  open("README.md",function(err,log){  
    loaded = true;
    assert.ifError(err)
    assert.ok(Buffer.isBuffer(log))
    assert.type(log.toString(),"string")
    assert.ok(log.length>0)
  })
  beforeExit(function(){assert.ok(loaded)})
}

exports["GET Stream an absolute file"] = function(beforeExit){
  var stream = writeStream();
  open("file:///var/log/system.log",stream)
  beforeExit(function(){
    assert.ok(stream.written)
    assert.ok(stream.ended)
  })
}
 
exports["GET Stream a website to a file"] = function(beforeExit){
  var path = "/tmp/goog-"+Date.now()+".html";
  var file = require("fs").createWriteStream(path)
  open("https://encrypted.google.com/search?q=open+uri",file)
  beforeExit(function(){
    assert.doesNotThrow(function(){
      require("fs").statSync(path)
    })
  })
}

exports["GET a text file from ftp"] = function(beforeExit){
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