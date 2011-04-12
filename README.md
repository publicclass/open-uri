# Asynchronous Open URI

  A CommonJS module inspired by Rubys Open-URI library.


## Install

  It's available on npm, so a simple `npm install open-uri` should be enough.


## Usage

	var open = require("open-uri");

	// Get a website
	open("http://google.com",function(err,google){console.log(google)})

	// Get a file
	open("/var/log/system.log",function(err,log){console.log(log)})

	// Stream a file to STDOUT
	open("file:///var/log/system.log",process.stdout)

	// Stream a website to a file
	var file = require("fs").createWriteStream("/tmp/goog.html")
	open("https://encrypted.google.com/search?q=open+uri",file)

	// Chain it 
	open("http://google.com",console.log)("http://publicclass.se",process.stdout)
  
  // Get a file off of an FTP (with auth)
  open("ftp://user:pass@ftp.example.com/myfile.txt",function(err,txt){console.log(txt)})


## Supported schemes

  http, https, file & ftp

Uses the [addressable module](https://github.com/publicclass/addressable) for parsing the scheme and the [mime module](https://github.com/bentomas/node-mime) for parsing the data.


### Options for all schemes

* `stream`    (boolean) For when you only want the callback to receive a stream instead of the complete body as the second argument. Defaults to false.


### Options for HTTP(S)

* `follow`    (boolean) Follow redirects. Defaults to true.

* `headers`   (object)  Headers to pass along with the HTTP request.


## History

### 0.2.1

* [Feature] Better parsing of content using the [mime module](https://github.com/bentomas/node-mime) for Content-Type lookup.

* [Feature] Initial _FTP_ support using [node-ftp](https://github.com/mscdex/node-ftp).

### 0.2.0

* _HTTP(S)_ [Feature] Now supports gzip responses (and adds a 'Accept-Encoding: gzip'-header if there is none already).

* _HTTP(S)_ [Feature] Now decodes JSON if response is of 'Content-Type: application/json'.

* _HTTP(S)_ [Bug] Fixed an issue with redirects.


### 0.1.0

* Initial version.


## TODO

*  _HTTP(S)_ Handle binary responses. Buffer it up entirely if it's not a stream (should probably recommend 'streaming' over a certain Content-Length).

*  _HTTP(S)_ Support older versions of Node? Currently only support 0.3.7 and up (because of the new HTTP Client API).

*  _HTTP(S)_ Proxy support?

* More schemes support? Suggestions?

* Get the tests to pass, having some issues with faking a Writeable Stream.


## Thanks to

* [Mikeal Rogers](https://github.com/mikeal), for his excellent [request module](https://github.com/mikeal/request/).

* [TJ Holowaychuck](https://github.com/visionmedia), for his minimalist projects inspiring this little tool.


## License 

(The MIT License)

Copyright (c) 2011 Robert Sk&ouml;ld &lt;robert@publicclass.se&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.