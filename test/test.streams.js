var open = require('../')

// Stream from HTTP to both FTP and File at once...
var xyz = open('https://encrypted.google.com/search?q=open+uri')
// xyz.pipe(open('ftp://abc'))
xyz.pipe(open('file:///tmp/enc-google-'+Date.now()+'.html'))
