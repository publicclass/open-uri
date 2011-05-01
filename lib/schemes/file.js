/**
*   File Scheme
*
*   Available options:
*
*     {Boolean} stream    For when you only want the callback to receive a stream instead of the complete body as the second argument. Defaults to `false`.
*     {String}  encoding  The encoding of the file to read.
*/
var fs = require("fs")
  , path = require("path")
  , utils = require("../utils");

module.exports = function(uri,opts,output){
  if( uri.isRelative() ){
    uri.pathname = path.join(process.cwd(),uri.pathname);
    uri.normalize()
  }
  if( !path.existsSync(uri.pathname) )
    return utils.error(output,new Error("[OpenURI] File Not Found: "+uri.pathname))
  
  var args = opts.start && opts.end ? [uri.pathname,opts] : [uri.pathname]
  try {
    if( typeof output == "function" ){
      if( opts.stream ){
        output(null,fs.createReadStream.apply(fs,args));
      } else {
        fs.readFile(uri.pathname,opts.encoding,output);
      }
    } else {
      fs.createReadStream.apply(fs,args).pipe(output)
    }
  } catch(e) {
    utils.error(output,e);
  }
}
