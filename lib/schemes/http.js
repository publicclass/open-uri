/**
*   HTTP Scheme
*
*   Available options:
*
*     {Boolean} stream
*       For when you only want the callback to receive a stream instead of the complete body as the second argument. Defaults to `false`.
*     {Boolean} follow
*       Follow redirects. Defaults to `true`.
*     {Object}  headers
*       Headers to pass along with the HTTP request.
*     {Boolean} gzip
*       If the request should be attempted with gzip. Defaults to `true` if the 'node-compress'-module is available.
*     {String} method
*       HTTP request method. Default 'GET'. 
*     {ReadableStream|Buffer|String} body
*       Body to write to the request.
*/

var addressable = require("addressable")
  , open = require("../open-uri")
  , mime = require("mime")
  , utils = require("../utils")
  , Buffer = require("buffer").Buffer;

var gzip = true;
try { 
  var compress = require("compress") } 
catch(e) { 
  gzip = false 
}

module.exports = function http(uri,opts,output){  
  uri.headers = opts.headers = opts.headers || {}
  
  // HTTP Auth
  if( uri.userinfo && !uri.headers.authorization )
    uri.headers.authorization = "Basic " + utils.toBase64(uri.userinfo);
  
  // Use gzip?
  var gzip = typeof opts.gzip == "undefined" ? gzip : opts.gzip;
  if( gzip && !(uri.headers["accept-encoding"] || uri.headers["Accept-Encoding"] || "") )
    uri.headers["accept-encoding"] = "gzip";
  
  // HTTP method
  uri.method = opts.method || "GET";
  
  // Body Content-Length
  if( typeof opts.body == "string" )
    uri.headers["content-length"] = Buffer.byteLength( opts.body );
  if( Buffer.isBuffer( opts.body ) )
    uri.headers["content-length"] = opts.body.length;
  
  var req = require(uri.scheme).request(uri,function(res){
    // Follow Redirects
    if( opts.follow !== false && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location ){
      if( res.headers.location[0] == '/' ) // It's an invalid 'relative' Location, prepend with current host
        res.headers.location = uri.scheme + '://' + uri.authority + res.headers.location;
      opts.headers.host = addressable.parse(res.headers.location).host;
      return open(res.headers.location,opts,output);
    }
    
    // TODO How should other statusCodes be handled? (like 403, 404, 500), should they be returned as Errors?
    
    // Handle gzip responses
    var stream = res;
    if( gzip && ~(res.headers['content-encoding']||"").indexOf("gzip") )
      res.pipe(stream = new compress.GunzipStream());
    
    if( typeof output == "function" ){
      if( opts.stream ){
        output(null,stream);
      } else {
        utils.buffer(res.headers["content-type"],uri.pathname,stream,output)
      }
    } else {
      stream.pipe(output);
    }
  }).on('error',function(e){
    utils.error(output,e)
  })
  
  // Handle a request body.
  if( typeof opts.body == "string" || Buffer.isBuffer( opts.body ) )
    req.end(opts.body);
  else if( typeof opts.body == "object" && "pipe" in opts.body && opts.body.readable )
    opts.body.pipe(req);
  else
    req.end();
}
