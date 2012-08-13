/**
*   File Scheme
*
*   Available options:
*
*     {Boolean} buffer    For when you only want the body to be buffered and returned as the second argument instead of receiving the direct stream. Defaults to `true`.
*     {String}  encoding  The encoding of the file to read.
*/
var fs = require("fs")
  , path = require("path")
  , utils = require("../utils")
  , exists = fs.exists || path.exists;

module.exports = function(uri,opts,output){
  // Default to buffer (using `opts.stream` for backward compability)
  if( !opts.hasOwnProperty('buffer') )
    opts.buffer = !opts.stream;

  if( uri.isRelative() ){
    uri.pathname = path.join(process.cwd(),uri.pathname);
    uri.normalize()
  }

  exists(uri.pathname, function(exists){
    if( !exists )
      return utils.error(output,new Error("[OpenURI] File Not Found: "+uri.pathname))

    var args = opts.start && opts.end 
      ? [uri.pathname,opts] // with 'range'
      : [uri.pathname];     // no 'range'

    try {
      if( typeof output == "function" ){
        if( opts.buffer ){
          fs.readFile(uri.pathname,opts.encoding,output);
        } else {
          output(null,fs.createReadStream.apply(fs,args));
        }
      } else {
        fs.createReadStream.apply(fs,args).pipe(output)
      }
    } catch(e) {
      utils.error(output,e);
    }
  })
}
