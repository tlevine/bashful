#!/usr/bin/env node
var bash = require('../')(process.env);
var s = bash.createStream();
process.stdin.pipe(s).pipe(process.stdout);
