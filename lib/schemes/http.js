/**
*   HTTP Scheme
*
*   Available options:
*
*     {Boolean} stream    For when you only want the callback to receive a stream instead of the complete body as the second argument. Defaults to `false`.
*     {Boolean} follow    Follow redirects. Defaults to `true`.
*     {Object}  headers   Headers to pass along with the HTTP request.
*     {Boolean} gzip      If the request should be attempted with gzip. Defaults to `true` if the 'node-compress'-module is available.
*/

var addressable = require("addressable")
  , open = require("../open-uri")
  , utils = require("../utils");

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
    uri.headers.authorization = "Basic " + utils.toBase64(options.uri.userinfo);
  
  // Use gzip?
  var gzip = typeof opts.gzip == "undefined" ? gzip : opts.gzip;
  if( gzip && !(uri.headers["accept-encoding"] || uri.headers["Accept-Encoding"] || "") )
    uri.headers["accept-encoding"] = "gzip";
  
  // HTTP method
  uri.method = opts.method || "GET";
  
  var req = require(uri.scheme).request(uri,function(res){
    // Follow Redirects
    if( opts.follow !== false && res.statusCode > 299 && res.statusCode < 400 && res.headers.location ){
      opts.headers.host = addressable.parse(res.headers.location).host;
      return open(res.headers.location,opts,output);
    }  
    
    // TODO How should other statusCodes be handled? (like 403, 404, 500), should they be returned as Errors?
    
    var stream = res;
    if( gzip && ~(res.headers['content-encoding']||"").indexOf("gzip") )
      res.pipe(stream = new compress.GunzipStream());
      
    if( typeof output == "function" ){
      if( opts.stream ){
        output(null,stream);
      } else {
        utils.buffer(res.headers["content-type"],uri.path,stream,output)
      }
    } else {
      stream.pipe(output);
    }
  })
  req.on('error',function(e){
    utils.error(output,e)
  })
  req.end()
}
