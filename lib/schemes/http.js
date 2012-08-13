/**
*   HTTP Scheme
*
*   Available options:
*
*     {Boolean} buffer
*       For when you only want the body to be buffered and returned as the second argument instead of receiving the direct stream. Defaults to `true`.
*     {Boolean} follow
*       Follow redirects. Defaults to `true`.
*     {Object}  headers
*       Headers to pass along with the HTTP request.
*     {Boolean} gzip
*       If the request should be attempted with gzip. Defaults to `true`.
*     {String} method
*       HTTP request method. Default 'GET'. 
*     {ReadableStream|Buffer|String} body
*       Body to write to the request.
*/

var addressable = require("addressable")
  , open = require("../open-uri")
  , mime = require("mime")
  , utils = require("../utils")
  , Buffer = require("buffer").Buffer
  , zlib = require("zlib");

module.exports = function http(uri,opts,output){
  uri.headers = opts.headers = opts.headers || {}

  // Default to gzip
  if( !opts.hasOwnProperty('gzip') )
    opts.gzip = true

  // Default to buffer (using `opts.stream` for backward compability)
  if( !opts.hasOwnProperty('buffer') )
    opts.buffer = !opts.stream;
  
  // HTTP Auth
  if( uri.userinfo && !uri.headers.authorization )
    uri.headers.authorization = "Basic " + utils.toBase64(uri.userinfo);
  
  // Use gzip?
  if( opts.gzip && !uri.headers["accept-encoding"] && !uri.headers["Accept-Encoding"] )
    uri.headers["accept-encoding"] = "gzip";
  
  // HTTP method
  uri.method = opts.method || "GET";
  
  // Body Content-Length
  if( typeof opts.body == "string" )
    uri.headers["content-length"] = Buffer.byteLength( opts.body );
  else if( Buffer.isBuffer( opts.body ) )
    uri.headers["content-length"] = opts.body.length;
  
  var req = require(uri.scheme).request(uri);

  // Handle response
  req.on('response',function(res){

    // Follow Redirects
    if( opts.follow !== false && ~[301,302,307].indexOf(res.statusCode) && res.headers.location ){
      var location = res.headers.location;
      // It's an invalid 'relative' Location, prepend with current host
      if( location[0] == '/' ) 
        location = uri.scheme + '://' + uri.authority + location;
      opts.headers.host = addressable.parse(location).host;
      return open(location,opts,output);
    }
    
    // Handle gzip responses
    var stream = res;
    if( opts.gzip && ~(res.headers['content-encoding']||"").indexOf("gzip") )
      res.pipe(stream = zlib.createUnzip());
    
    if( typeof output == "function" ){
      if( opts.buffer ){
        utils.buffer(res.headers["content-type"],uri.pathname,stream,function(err,body){
          output(null,body,res);
        })
      } else {
        output(null,stream);
      }
    } else {
      stream.pipe(output);
    }
  })

  // Request error
  req.on('error',function(e){
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
