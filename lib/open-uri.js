/**
*  Asynchronous Open URI, a CommonJS module inspired by Rubys Open-URI library.
*  
*  Usage:
*  
*     var open = require("open-uri");
*     
*     // Get a website
*     open("http://google.com",function(err,google){console.log(google)})
*  
*     // Get a file
*     open("/var/log/system.log",function(err,log){console.log(log)})
*     
*     // Stream a file to STDOUT
*     open("file:///var/log/system.log",process.stdout)
*     
*     // Stream a website to a file
*     var file = require("fs").createWriteStream("/tmp/goog.html")
*     open("https://encrypted.google.com/search?q=open+uri",file)
*     
*     // Chain it
*     open("http://google.com",console.log)("http://publicclass.se",console.log)
*  
*  Supported schemes:
*  
*     http, https & file
*  
* 
*  Options for all schemes:
*  
*         {Boolean} stream    For when you only want the callback to receive a stream instead of the complete body as the second argument. Defaults to false.
*  
*
*  Options for http(s):
*  
*         {Boolean} follow    Follow redirects. Defaults to true.
*         {Object} headers    Headers to pass along with the HTTP request.
*  
*  
*  @param   {String} uri                        The URI to open.
*  @param   {Object} opts                       (optional) Options for the scheme. 
*  @param   {Function|WriteableStream}  output  Where to send the data.
*  @return  Itself for chainability.
*/
var addressable = require("addressable");

var gzip = true;
try { var compress = require("compress") } 
catch(e) { gzip = false }

function open(uri,opts,output){
  if( typeof opts == "function" )
    output = opts, opts = {};
    
  if( !output )
    return error( output, new Error("[OpenURI] Invalid output.") );
  
  if( !(uri = addressable.parse(uri)) ) 
    return error( output, new Error("[OpenURI] Invalid URI:" + arguments[0]) );
  
  if( handler = open[uri.scheme||"file"] )
    handler.call(this,uri,opts,output);
  else
    return error( output, new Error("[OpenURI] Invalid scheme: "+uri.scheme) );
    
  return open;
}

open.https =
open.http = function(uri,opts,output){  
  uri.headers = opts.headers = opts.headers || {}
  if( uri.userinfo && !uri.headers.authorization )
    uri.headers.authorization = "Basic " + toBase64(options.uri.userinfo);
  if( gzip && !(uri.headers["accept-encoding"]||uri.headers["Accept-Encoding"]||"") )
    uri.headers["accept-encoding"] = "gzip";
  uri.path += uri.search; // http client wants it all in one...
  require(uri.scheme).get(uri,function(res){
    if( opts.follow !== false && res.statusCode > 299 && res.statusCode < 400 && res.headers.location ){
      if( !opts.headers.host )
        opts.headers.host = addressable.parse(res.headers.location).host;
      return open(res.headers.location,opts,output);
    }  
    // TODO How should other statusCodes be handled? (like 403, 404, 500), should they be 0returned as an Error?
    var stream = res;
    if( gzip && ~(res.headers['content-encoding']||"").indexOf("gzip") )
      res.pipe(stream = new compress.GunzipStream());
    stream.on("error",function(err){ error(output,err) })
    if( typeof output == "function" ){
      if( opts.stream ){
        output(null,stream);
      } else {
        decode(res.headers["content-type"],stream,output)
      }
    } else {
      stream.pipe(output);
    }
  }).on('error',function(e){
    error(output,e)
  })
}

var decoder = {};
decoder["application/json"] = function(body){ return JSON.parse(body) }

function decode(type,stream,output){
  var body = "";
  stream.setEncoding("utf8")
  stream.on("data",function(chunk){ body+=chunk })
  stream.on("end",function(){ output(null,decoder[type] ? decoder[type](body) : body,res) })
  // TODO Support other formats (like binary)
}

open.file = function(uri,opts,output){
  var fs = require("fs");
  if( uri.isRelative() ){
    uri.path = require("path").join(process.cwd,uri.path);
    uri.normalize()
  }
  var args = opts.start && opts.end ? [uri.path,opts] : [uri.path]
  try {
    if( typeof output == "function" ){
      if( opts.stream ){
        output(null,fs.createReadStream.apply(fs,args));
      } else {
        fs.readFile(uri.path,opts.encoding,output);
      }
    } else {
      fs.createReadStream.apply(fs,args)
    }
  } catch(e) {
    return error(output,e);
  }
}

open.ftp = function(uri,opts,output){
  var ftp = require("ftp");
    , client = new ftp(uri);
  client.on("connect",function(){
    var isDir = uri.path.charAt(uri.path.length-1) == "/";
    if( isDir ){
      // TODO If path is a directory, we client.list(), if there's a uri.path, then we first have to client.cwd(uri.path)
      error( output, new Error("Not implemented yet, listing a directory with ftp://"));
    } else if( opts.body ){
      // TODO If the path is a file, and body is in opts, we upload it with client.put(uri.path)
      error( output, new Error("Not implemented yet, uploading a file to ftp://"));
    } else {
      // If the path is a file, client.get(uri.path) and do the stream magic we do in open.file
      client.get(uri.path,function(err,stream){
        stream.on("error",function(err){ error(output,err); client.end() })
        if( typeof output == "function" ){
          if( opts.stream ){
            output(null,stream);
          } else {
            decode(null,stream,output)
          }
        } else {
          stream.pipe(output);
        }s
      })
    }
  })
  
}


function error(output,err){
  if( typeof output == "function")
    output(err)
  else 
    throw err;
  return open;
}

var toBase64 = function(str) {
  return (new Buffer(str||"", "ascii")).toString("base64");
};

module.exports = open;