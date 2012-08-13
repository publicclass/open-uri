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
  , http = require("./http")
  , exists = fs.exists || path.exists
  , read = fs.readFile;

module.exports = function https(uri,opts,output){
  // Looks for SSL Key and Certificate in:
  //   1. In the options as a normal https.get(). Should it expand them if it's a path? I.e. {key: "./key.pem", cert: "./cert.pem"} is fs.readSync()-ed?
  //   2. ENV-variables to their paths, NODE_HTTPS_KEY=./key.pem NODE_HTTPS_CERT=./cert.pem
  //   3. Check for them in the process pwd.
  
  var key  = opts.key  || process.env.NODE_HTTPS_KEY  || "./key.pem"
  var cert = opts.cert || process.env.NODE_HTTPS_CERT || "./cert.pem"
  var pending = 2;

  // Call this when key/cert is loaded
  var download = http.bind(this,uri,opts,output);
  
  // Load Key if it's a file
  readIfFile(key,function(key){
    opts.key = key;
    --pending || download();
  })

  // Load Certificate if it's a file
  readIfFile(cert,function(cert){
    opts.cert = cert;
    --pending || download();
  })
}

function readIfFile(file,fn){
  var uri = addressable.parse( file );

  // If its a file:// or no scheme, check if it
  // exists and if so read it's contents. otherwise
  // assume it's the proper data already
  if( uri && (uri.scheme == "file" || !uri.scheme) ){
    exists(uri.pathname,function(yes){
      if( yes ) 
        read(uri.pathname,function(err,data){
          fn(data||file);
        });
      else 
        fn(file)
    })
  } else {
    fn(file)
  }
}