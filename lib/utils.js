var mime = require("mime")
  , open = require("./open-uri");

/**
* Helper for buffering up a stream and passing its content to a callback.
* 
* @param {String} type
*     The mime type of the stream.
* @param {String} path
*     The path to lookup the type from in case it's not available.
* @param {ReadableStream} stream
*     A ReadableStream to buffer from.
* @param {Function} output
*     Callback which is called whenever the buffering is completed or if there was an error.
*/
exports.buffer = function buffer(type,path,stream,output){
  // Fix the type if it comes from a HTTP header
  type = (type||'').split(";")[0];
  var mimeType = mime.lookup(type||path||'')
  var buf = [], len = 0;
  stream.setEncoding(mime.charsets.lookup(mimeType))
  stream.on("error",function(err){ error(output, err); }) // TODO Close the stream on error?
  stream.on("timeout",function(){ error(output,new Error("[OpenURI] Connection timed out.")); }) // TODO Close the stream on timeout?
  stream.on("data",function(chunk){ buf.push(chunk); len += Buffer.byteLength(chunk); })
  stream.on("end",function(){
    try {
      var data = parse(type,buf,len) || parse(mimeType,buf,len) || parse.default(buf,len);
      output(null,data,stream) 
    } catch(e){
      error(output,e)
    }
  })
}

/**
* Helper for parsing the content based on mime-type. Ex. parsing a JSON string to an object, text based content to a string and binary as a buffer.
* 
* @param {String} type
*     The mime-type.
* @param {Array<Buffer>} buf
*     An array of Buffer objects.
* @param {Integer} len
*     The total size of the buffers.
* @return The parsed content.
*/
function parse(type,buf,len){
  for( key in parse )
    if( ~type.indexOf(key) )
      return parse[key](buf,len);
  return false;
}
parse["text/"] = function(buf,len){ return buf.join("") }
parse["application/json"] = function(buf,len){ return JSON.parse(buf.join("")) }
parse["application/x-www-form-urlencoded"] = function(buf,len){ return require("querystring").parse(buf.join("")) }
parse.default = 
parse["application/octet-stream"] = function(buf,len){
  var body = new Buffer(len), offset = 0;
  buf.forEach(function(b){ offset += body.write(b,offset) })
  return body
}
exports.parse = parse;

/**
* Helper for returning or throwing errors depending on the type of `output`.
* 
* @param {Function|WritableStream|Null} output
*     The output callback or stream.
* @param {Error} err
*     The Error to throw/call.
* @returns `open` for chainability.
*/
function error(output,err){
  if( typeof output == "function" )
    output(err);
  else 
    throw( err );
  return open;
}
exports.error = error;

/**
* Converts string to base64.
*
* @param {String|Buffer|Array} str
*     Buffer friendly object to convert.
* @return a Base64 encoded string.
*/
exports.toBase64 = function toBase64(str){ 
  return (new Buffer(str||"", "ascii")).toString("base64") 
}

/**
* Checks if the output is a valid callback or stream.
* 
* @param {String|WritableStream} output
*     The output to check against.
* @return `true` if it's valid, otherwise `false`.
*/
exports.isValidOutput = function isValidOutput(output){
  return typeof output == "function" || ( typeof output == "object" && output.writable && "pipe" in output )
}