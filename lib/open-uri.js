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
*  @param {String} uri                        The URI to open.
*  @param {Object} opts                       (optional) Options for the scheme. 
*  @param {Function|WriteableStream}  output  Where to send the data.
*  @return Itself for chainability.
*/
var addressable = require("addressable");
module.exports = function open(uri,opts,output){
  if( typeof opts == "function" )
    output = opts, opts = {};
  
  uri = addressable.parse(uri)
  if( !uri ) return open;
  
  switch(uri.scheme){
    case "https":
    case "http":
      // TODO Take care of HTTP Auth if uri.username/uri.password is set...
      uri.headers = opts.headers || {}
      require(uri.scheme).get(uri,function(res){    
        if( opts.follow !== false && res.statusCode > 299 && res.statusCode < 400 && res.headers.location ){
          return open(res.headers.location,opts,output);
        }
        if( typeof output == "function" ){
          // TODO Handle different content-types: parse json, return a buffer etc.
          var body;
          res.on("data",function(chunk){ body+=chunk })
          res.on("end",function(){ output(null,body,res) })
          res.on("error",function(err){ output(err) })
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
      if( typeof output == "function" ){
        fs.readFile(uri.path,opts.encoding,output);
      } else {
        if( opts.start && opts.end )
          fs.createReadStream(uri.path,opts).pipe(output);
        else
          fs.createReadStream(uri.path).pipe(output);
      }
      break;
    default:
      throw new Error("Invalid scheme: "+uri.scheme)
  }
  return open;
}