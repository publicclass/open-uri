/**
*   FTP Scheme
*
*   Available options:
*
*     {Boolean} buffer    For when you only want the body to be buffered and returned as the second argument instead of receiving the direct stream. Defaults to `true`.
*     {Boolean} anonymous If no user info is in the URI, add anonymous. Defaults to `true`.
*/
var ftp = require("ftp")
  , utils = require("../utils");

module.exports = function(uri,opts,output){
  var client = new ftp()
    , authenticated = false;

  // Default to buffer (using `opts.stream` for backward compability)
  if( !opts.hasOwnProperty('buffer') )
    opts.buffer = !opts.stream;
  
  if( !uri.userinfo && opts.anonymous !== false ){
    uri.username = "anonymous";
    uri.password = "anonymous@";
  }
  
  client.on("connect",function request(err){
    if( err ) return utils.error(output,err);
    
    // Authenticate first if uri has userinfo or opts.anonymous is set.
    if( uri.userinfo && !authenticated ){
      return client.auth(uri.username,uri.password,function(err){
        authenticated = !err
        request(err)
      })
    }
    
    // TODO Add this to addressable? or maybe it's in the path-module?
    var isDir = uri.path.charAt(uri.path.length-1) == "/";
    if( isDir ){
      // TODO If path is a directory, we client.list(uri.pathname)
      utils.error( output, new Error("Not implemented yet, listing a directory with ftp://"));
    } else if( opts.body ){
      // TODO If the path is a file, and body is in opts, we upload it with client.put(uri.pathname)
      utils.error( output, new Error("Not implemented yet, uploading a file to ftp://"));
    } else {
      // If the path is a file, client.get(uri.path) and do the stream magic we do in open.file()
      client.get(uri.pathname,function(err,stream){
        if( err ) return utils.error( output, err );
        // Make sure the client closes when done/failed.
        stream.on("error",function(){ client.end() })
        stream.on("end",function(){ client.end() })
        if( typeof output == "function" ){
          if( opts.buffer ){
            utils.buffer(null,uri.pathname,stream,output)
          } else {
            output(null,stream);
          }
        } else {
          stream.pipe(output);
        }
      })
    }
  }).connect(uri.port,uri.host)
}