var open = require("../lib/open-uri")
  , addressable = require("addressable")
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
    var headers = {'Content-Type': req.headers["content-type"] || 'text/plain'}
    if( req.headers["content-length"] ) 
      headers["Content-Length"] = req.headers["content-length"];
    res.writeHead(200, headers)
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

exports["GET a website with an addressable.URI object"] = function(beforeExit){
  var loaded = false;
  var url = addressable.parse("http://google.com");
  open(url,function(err,google){
    loaded = true;
    assert.ifError(err)
    assert.type(google,"string")
    assert.ok(google.length>0)
  })
  beforeExit(function(){assert.ok(loaded)})
}

exports["GET a website with a node.js built-in URL object"] = function(beforeExit){
  var loaded = false;
  var url = require("url").parse("http://google.com");
  open(url,function(err,google){
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

exports["GET a website with auth"] = function(beforeExit){
  var loaded = false;
  open("http://user:pass@google.com",function(err,google){
    loaded = true;
    assert.ifError(err)
    assert.type(google,"string")
    assert.ok(google.length>0)
  })
  beforeExit(function(){assert.ok(loaded)})
}

exports["GET an encrypted website with auth"] = function(beforeExit){
  var loaded = false;
  open("https://user:pass@google.com",function(err,google){
    loaded = true;
    assert.ifError(err)
    assert.type(google,"string")
    assert.ok(google.length>0)
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


exports["POST stream text to a website"] = function(){
  echo(++port,function(server){
    var file = require("fs").createReadStream("README.md");
    open("http://localhost:"+port,{method:"POST",body:file},function(err,dump,res){
      server.close()
      assert.ifError(err)
      assert.equal(res.headers["content-type"],"text/plain")
      assert.type(dump,"string")
      assert.eql(dump,require("fs").readFileSync("README.md","utf8"))
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

exports["GET a redirect with a relative Location"] = function(beforeExit){
  var loaded = false;
  open("http://golang.org/cmd/5a",function(err,go,res){
    loaded = true
    assert.ifError(err)
    assert.includes(go,'<title>Command 5a - The Go Programming Language</title>')
  })
  beforeExit(function(){assert.ok(loaded)})
}

exports["GET a redirect with a relative Location without 'follow'"] = function(beforeExit){
  var loaded = false;
  open("http://golang.org/cmd/5a",{follow:false},function(err,go,res){
    loaded = true
    assert.ifError(err)
    assert.equal(res.statusCode,301)
    assert.includes(go,'Moved Permanently')
  })
  beforeExit(function(){assert.ok(loaded)})
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