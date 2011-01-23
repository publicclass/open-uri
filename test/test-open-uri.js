var open = require("../lib/open-uri")
  , assert = require("assert");
  
function writeStream(){
  var stream = {
    written: false,
    ended: false,
    writable: true,
    on: function(evt,fn){},
    write: function(d){stream.written = true},
    end: function(d){stream.ended = true}
  }
  return stream
}

exports["Get a website"] = function(beforeExit){
  var loaded = false;
  open("http://google.com",function(err,google){
    loaded = true;
    assert.type(google,"string")
    assert.ok(google.length>0)
  })
  beforeExit(function(){assert.ok(loaded)})
}

exports["Get a relative file"] = function(beforeExit){
  var loaded = false;
  open("../README",function(err,log){  
    loaded = true;
    assert.ok(!err)
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
