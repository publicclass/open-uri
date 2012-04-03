
// A simple test echo server
module.exports = function echo(fn){
  var http = require("http").createServer(function(req,res){
    var headers = {'Content-Type': req.headers["content-type"] || 'text/plain'}
    if( req.headers["content-length"] ) 
      headers["Content-Length"] = req.headers["content-length"];
    res.writeHead(200, headers)
    req.pipe(res)
    res.on('end',function(){
      http.close()
    })
  })
  http.listen(function(){fn(http,http.address().port)})
}