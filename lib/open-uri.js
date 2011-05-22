/**
*  Asynchronous Open URI, inspired by Rubys Open-URI library.
*  
*  @param   {URI|String} uri                    The URI to open.
*  @param   {Object} opts                       (optional) Options for the scheme (see each scheme for details). 
*  @param   {Function|WriteableStream}  output  Where to send the data.
*  @return  Itself for chainability.
*/
var addressable = require("addressable")
  , utils = require("./utils")
  , inspect = require("util").inspect;

module.exports = function open(uri,opts,output){
  if( utils.isValidOutput( opts ) )
    output = opts, opts = {};
    
  if( !utils.isValidOutput( output ) )
    return utils.error( output, new Error("[OpenURI] Invalid output: " + inspect(arguments)) );
  
  if( !(uri = addressable.parse(uri)) ) 
    return utils.error( output, new Error("[OpenURI] Invalid URI: " + inspect(arguments[0])) );
  
  try {
    require("./schemes/"+(uri.scheme||"file")).call(this,uri,opts,output);
  } catch( e ){
    console.error(e.stack)
    return utils.error( output, new Error("[OpenURI] Invalid scheme: " + inspect(uri)) );
  }
  
  return open;
}