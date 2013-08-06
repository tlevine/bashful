#!/usr/bin/env node
var bash = require('../');
var stream = require('stream');

var wonkyfs = {}
wonkyfs.read = function(path, opts) {
  var readStream = new stream.Readable();
  if (path === '/dev/null') {
    // Do nothing
  } else if (path === '/dev/urandom') {
    readStream._read = function(size) {
      for (var i = 0; i < size; i++) {
        // Write a byte
        var letter = 0;
        for (var j = 0; j < 8; j++) {
          letter += '' + Math.round(Math.random())
        }

        readStream.push(String.fromCharCode(parseInt(letter, 2)))
      }
    }
  } else if (path === '/dev/zero') {
    readStream._read = function(size) {
      for (var i = 0; i < size; i++) {
        readStream.push(String.fromCharCode(0))
      }
    }
  } else if (path === '/dev/') {
  } else if (path === '/dev/') {
  } else if (path === '/dev/') {
  } else {
    readStream._read = function() {
      readStream.push(localStorage.getItem(path))
    }
  }
  return readStream
}

wonkyfs.write = function(path, opts) {
  var writeStream = new stream.Writable();
  if (path === '/dev/null') {
  } else if (path === '/dev/audio') {
  } else {
  }
}

var sh = bash({
    env: process.env,
    spawn: require('child_process').spawn,
    write: fs.createWriteStream,
    read: fs.createReadStream,
    exists: fs.exists
});

var s = sh.createStream();
process.stdin.pipe(s).pipe(process.stdout);

