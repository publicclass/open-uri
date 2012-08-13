# 0.4.3 / 2012-08-13

* [Change] Now using built-in zlib for gzip support (thanks to [sphericalhorse](https://github.com/sphericalhorse))

# 0.4.2 / 2012-08-13

* [Change] Rewrote tests to use [mocha](https://github.com/visionmedia/mocha) and [should](https://github.com/visionmedia/should.js).
* [Change] Compatibility with Node 0.8 (thanks to [wdavidw](https://github.com/wdavidw))
* [Change] Fully asynchronous (thanks to [wdavidw](https://github.com/wdavidw))

# 0.4.1 / 2012-03-02

* [Fix] Added `buffer`-option to file and ftp schemes.
* [Change] Updated mime dependency to 1.2.5.

# 0.4.0 / 2012-03-02

* [Change] Added the `buffer` option, which is an inverted `stream`, which is now deprecated. 
* [Fix] Avoid a global variable (by [senorpedro](https://github.com/senorpedro/))
* [Fix] _HTTP_/_HTTPS_ Only 301, 302 and 307 is proper statusCodes for redirects.

# 0.3.5 / 2011-07-15

* [Fix] Use Buffer.byteLength(body) only on strings, and body.length on Buffers.
* [Fix] Support for broken redirect implementations that give relative Location: headers.

# 0.3.4 / 2011-07-11

* [Fix] Use Buffer.byteLength(body) for Content-Length header as well, it's just better (and fixes a bug where the body was cut off).

# 0.3.3 / 2011-07-05

* [Fix] Avoid 'Out of bounds'-errors by using Buffer.byteLength(chunk) instead of chunk.length.

# 0.3.2 / 2011-05-22

* [Fix] Errors was being thrown when using userinfo in HTTP uris.

# 0.3.1 / 2011-05-22

* [Fix] Updated `addressable` dependency to 0.3.3. Now both addressable.URI and Nodes built-in URL objects are valid as the `uri` argument.
* [Fix] Fixed error thrown when an error occurs in utils.buffer().

# 0.3.0 / 2011-05-01

* [Feature] Updated `addressable` dependency to 0.3.1.

* [Feature] _HTTPS_ Added key and certificate parsing.

* [Feature] _HTTP_/_HTTPS_ Added a `method` option can be used if anything other than GET is desired.

* [Feature] _HTTP_/_HTTPS_ Added a `body` options for passing a payload with the request. Can be either a ReadableStream, a String or a Buffer.

# 0.2.2 / 2011-04-26

* [Feature] Re-factored the schemes into separate files. Now adding more schemes will be much easier.

* [Feature] Added a simple binary. Usage: `open-uri http://google.com`

* [Fix] _FTP_ is now closing properly when completed or failed.

# 0.2.1 / 2011-04-12

* [Feature] Better parsing of content using the [mime module](https://github.com/bentomas/node-mime) for Content-Type lookup.

* [Feature] _FTP_ Initial support using the [node-ftp module](https://github.com/mscdex/node-ftp).


# 0.2.0 / 2011-02-16

* [Feature] _HTTP(S)_ Now supports gzip responses (and adds a 'Accept-Encoding: gzip'-header if there is none already).

* [Feature] _HTTP(S)_ Now decodes JSON if response is of 'Content-Type: application/json'.

* [Fix] _HTTP(S)_ Fixed an issue with redirects.


# 0.1.0 / 2011-02-08

* Initial version.
