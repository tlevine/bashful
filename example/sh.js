#!/usr/bin/env node
var bash = require('../')(process.env);
bash.on('command', require('child_process').spawn);

var s = bash.createStream();
process.stdin.pipe(s).pipe(process.stdout);
