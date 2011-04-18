/**
*  Asynchronous Open URI, inspired by Rubys Open-URI library.
*  
*  @param   {String} uri                        The URI to open.
*  @param   {Object} opts                       (optional) Options for the scheme (see each scheme for details). 
*  @param   {Function|WriteableStream}  output  Where to send the data.
*  @return  Itself for chainability.
*/
var addressable = require("addressable")
  , mime = require("mime");

var gzip = true;
try { var compress = require("compress") } 
catch(e) { gzip = false }

function open(uri,opts,output){
  if( isValidOutput( opts ) )
    output = opts, opts = {};
    
  if( !isValidOutput( output ) )
    return error( output, new Error("[OpenURI] Invalid output: " + require("util").inspect(arguments)) );
  
  if( !(uri = addressable.parse(uri)) ) 
    return error( output, new Error("[OpenURI] Invalid URI: " + require("util").inspect(arguments[0])) );
  
  if( handler = open[uri.scheme||"file"] )
    handler.call(this,uri,opts,output);
  else
    return error( output, new Error("[OpenURI] Invalid scheme: " + require("util").inspect(uri)) );
    
  return open;
}

/**
*   HTTP/HTTPS Scheme
*
*   Available options:
*
*     {Boolean} stream    For when you only want the callback to receive a stream instead of the complete body as the second argument. Defaults to `false`.
*     {Boolean} follow    Follow redirects. Defaults to `true`.
*     {Object}  headers   Headers to pass along with the HTTP request.
*     {Boolean} gzip      If the request should be attempted with gzip. Defaults to `true` if the 'node-compress'-module is available.
*/
open.https =
open.http = function(uri,opts,output){  
  uri.headers = opts.headers = opts.headers || {}
  if( uri.userinfo && !uri.headers.authorization )
    uri.headers.authorization = "Basic " + toBase64(options.uri.userinfo);
  var gzip = typeof opts.gzip == "undefined" ? gzip : opts.gzip;
  if( gzip && !(uri.headers["accept-encoding"]||uri.headers["Accept-Encoding"]||"") )
    uri.headers["accept-encoding"] = "gzip";
  uri.path += uri.search; // http client wants it all in one...
  // console.log("HTTP %j",uri)
  require(uri.scheme).get(uri,function(res){
    if( opts.follow !== false && res.statusCode > 299 && res.statusCode < 400 && res.headers.location ){
      opts.headers.host = addressable.parse(res.headers.location).host;
      return open(res.headers.location,opts,output);
    }  
    // TODO How should other statusCodes be handled? (like 403, 404, 500), should they be returned as an Error?
    var stream = res;
    if( gzip && ~(res.headers['content-encoding']||"").indexOf("gzip") )
      res.pipe(stream = new compress.GunzipStream());
    if( typeof output == "function" ){
      if( opts.stream ){
        output(null,stream);
      } else {
        buffer(res.headers["content-type"],uri.path,stream,output)
      }
    } else {
      stream.pipe(output);
    }
  }).on('error',function(e){
    error(output,e)
  })
}

/**
*   File Scheme
*
*   Available options:
*
*     {Boolean} stream    For when you only want the callback to receive a stream instead of the complete body as the second argument. Defaults to `false`.
*     {String}  encoding  The encoding of the file to read.
*/
open.file = function(uri,opts,output){
  var fs = require("fs");
  if( uri.isRelative() ){
    uri.path = require("path").join(process.cwd(),uri.path);
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
      fs.createReadStream.apply(fs,args).pipe(output)
    }
  } catch(e) {
    error(output,e);
  }
}

/**
*   FTP Scheme
*
*   Available options:
*
*     {Boolean} stream    For when you only want the callback to receive a stream instead of the complete body as the second argument. Defaults to `false`.
*     {Boolean} anonymous If no user info is in the URI, add anonymous. Defaults to `true`.
*/
open.ftp = function(uri,opts,output){
  var ftp = require("ftp")
    , client = new ftp()
    , authenticated = false;
  
  if( !uri.userinfo && opts.anonymous !== false ){
    uri.username = "anonymous";
    uri.password = "anonymous@";
  }
  
  client.on("connect",function request(err){
    if( err ) return error(output,err);
    
    // Authenticate first if uri has userinfo or opts.anonymous is set.
    if( uri.userinfo && !authenticated ){
      return client.auth(uri.username,uri.password,function(err){
        authenticated = !err
        request(err)
      })
    }

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
        if( err ) return error(err,output);
        if( typeof output == "function" ){
          if( opts.stream ){
            output(null,stream);
          } else {
            buffer(null,uri.path,stream,output)
          }
        } else {
          stream.pipe(output);
        }
      })
    }
  }).connect(uri.port,uri.host)
}

function buffer(type,path,stream,output){
  // Fix the type if it comes from a HTTP header
  type = (type||'').split(";")[0];
  type = mime.lookup(type||path||'')
  var buf = [], len = 0;
  stream.setEncoding(mime.charsets.lookup(type))
  stream.on("error",function(err){ error(output, err) }) // TODO Close the stream on error?
  stream.on("timeout",function(){ error(output,new Error("[OpenURI] Connection timed out.")) }) // TODO Close the stream on timeout?
  stream.on("data",function(chunk){ buf.push(chunk); len += chunk.len; })
  stream.on("end",function(){ output(null,parse(type,buf,len),stream) })
}

function parse(type,buf,len){
  for( key in parse )
    if( ~type.indexOf(key) )
      return parse[key](buf,len);
  return parse.default(buf,len);
}
parse["text/"] = function(buf,len){ return buf.join("") }
parse["application/json"] = function(buf,len){ return JSON.parse(buf.join("")) }
parse.default = 
parse["application/octet-stream"] = function(buf,len){ 
  var body = new Buffer(len), offset = 0;
  buf.forEach(function(b){b.write(body,offset); offset += b.length})
  return body
}

function error(output,err){
  if( typeof output == "function" )
    output(err);
  else 
    throw( err );
  return open;
}

function toBase64(str){ 
  return (new Buffer(str||"", "ascii")).toString("base64") 
}

function isValidOutput(output){
  return typeof output == "function" || ( typeof output == "object" && output.writable )
}

module.exports = open;
open.parser = parse;