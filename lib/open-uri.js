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
module.exports = function open(uri,opts,output){
  if( typeof opts == "function" )
    output = opts, opts = {};
    
  if( !output )
    throw new Error("[OpenURI] Invalid output.");
  
  uri = addressable.parse(uri)
  if( !uri ) 
    throw new Error("[OpenURI] Invalid URI:"+arguments[0]);;
  
  switch(uri.scheme){
    case "https":
    case "http":
      uri.headers = opts.headers || {}
      if( uri.userinfo && !uri.headers.authorization )
        uri.headers.authorization = "Basic " + toBase64(options.uri.userinfo);
      require(uri.scheme).get(uri,function(res){    
        if( opts.follow !== false && res.statusCode > 299 && res.statusCode < 400 && res.headers.location )
          return open(res.headers.location,opts,output);
        if( typeof output == "function" ){
          if( opts.stream ){
            output(null,res);
          } else {
            // TODO Handle different content-types: parse json, return a buffer etc.
            var body;
            res.on("data",function(chunk){ body+=chunk })
            res.on("end",function(){ output(null,body,res) })
            res.on("error",function(err){ output(err) })
          }
        } else {
          res.pipe(output);
        }
      })
      break;
    case "file":
    case undefined:
      var fs = require("fs");
      if( uri.isRelative() ){
        // Prepend with path of callee.caller and normalize
        uri.path = require("path").join(__dirname,uri.path);
        uri.normalize()
      }
      var args = opts.start && opts.end ? [uri.path,opts] : [uri.path]
      if( typeof output == "function" ){
        if( opts.stream ){
          output(null,fs.createReadStream.apply(fs,args));
        } else {
          fs.readFile(uri.path,opts.encoding,output);
        }
      } else {
        fs.createReadStream.apply(fs,args)
      }
      break;
    default:
      throw new Error("Invalid scheme: "+uri.scheme)
  }
  return open;
}


var toBase64 = function(str) {
  return (new Buffer(str||"", "ascii")).toString("base64");
};