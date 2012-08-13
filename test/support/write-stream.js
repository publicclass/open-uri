function WriteStream(done){
  this.written = false;
  this.writable = true;
  var stream = this;
  this.on('error',done)
  this.on('end',function(){
    stream.should.have.property('written',true)
    done()
  })
}
WriteStream.prototype = {
  __proto__: require("stream").prototype,
  write: function(d){
    // console.log('WriteStream#write()')
    return this.written = true;
  },

  end: function(d){
    // console.log('WriteStream#end()')
    if( d ) this.write(d);
    this.emit('end');
  }
}
module.exports = WriteStream;