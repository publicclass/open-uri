/**
*   HTTPS Scheme
*
*   Available options:
*
*     {Boolean} stream    For when you only want the callback to receive a stream instead of the complete body as the second argument. Defaults to `false`.
*     {Boolean} follow    Follow redirects. Defaults to `true`.
*     {Object}  headers   Headers to pass along with the HTTP request.
*     {Boolean} gzip      If the request should be attempted with gzip. Defaults to `true` if the 'node-compress'-module is available.
*     {String}  method    HTTP request method. Default 'GET'.
*     {String}  key       Private key to use for SSL. Defaults to ENV var NODE_HTTPS_KEY or attempts to find it as "./key.pem".
*     {String}  cert      Public x509 certificate to use. Defaults to ENV var NODE_HTTPS_CERT or attempts to find it as "./cert.pem".
*     {String|Array} ca   An authority certificate or array of authority certificates to check the remote host against.
*/
var addressable = require("addressable")
  , fs = require("fs")
  , path = require("path")
  , http = require("./http");

module.exports = function https(uri,opts,output){
  // Looks for SSL Key and Certificate in:
  //   1. In the options as a normal https.get(). Should it expand them if it's a path? I.e. {key: "./key.pem", cert: "./cert.pem"} is fs.readSync()-ed?
  //   2. ENV-variables to their paths, NODE_HTTPS_KEY=./key.pem NODE_HTTPS_CERT=./cert.pem
  //   3. Check for them in the process pwd.
  
  var key  = opts.key  || process.env.NODE_HTTPS_KEY  || "./key.pem"
  var cert = opts.cert || process.env.NODE_HTTPS_CERT || "./cert.pem"
  
  // Load Key if it's a file
  var k = addressable.parse( key );
  if( k && k.scheme == "file" || !k.scheme && path.existsSync(key) )
    opts.key = fs.readFileSync(key);
  else if( !k )
    opts.key = key;
  
  // Load Certificate if it's a file
  var c = addressable.parse( cert );
  if( c && c.scheme == "file" || !c.scheme && path.existsSync(cert) )
    opts.cert = fs.readFileSync(cert);
  else if( !c )
    opts.cert = cert;
  
  http.call(this,uri,opts,output);
}