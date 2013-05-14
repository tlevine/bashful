#!/usr/bin/env node
var bash = require('../')(process.env);
bash.on('command', require('child_process').spawn);
bash.on('write', require('fs').createWriteStream);

var s = bash.createStream();
process.stdin.pipe(s).pipe(process.stdout);
