var test = require('tap').test;
var bash = require('../');
var through = require('through');
var concat = require('concat-stream');
var nextTick = typeof setImmediate !== 'undefined'
    ? setImmediate : process.nextTick
;

test('true $?', function (t) {
    t.plan(1);
    
    var env = {};
    var sh = bash(env);
    sh.on('command', run);
    
    var s = sh.createStream();
    s.pipe(concat(function (err, src) {
        t.equal(env['$?'], 0);
    }));
    s.end('true\n');
});

test('true and echo $?', function (t) {
    t.plan(2);
    
    var env = {};
    var sh = bash(env);
    sh.on('command', run);
    
    var s = sh.createStream();
    s.pipe(concat(function (err, src) {
        t.equal(src, '$ 0\n');
        t.equal(env['$?'], 0);
    }));
    s.end('true; echo $?\n');
});

function run (cmd, args) {
    var tr = through();
    tr.pause();
    if (cmd === 'true') {
        process.nextTick(function () {
            tr.emit('exit', 0);
            tr.queue(null);
            tr.resume();
        });
    }
    else if (cmd === 'false') {
        process.nextTick(function () {
            tr.emit('exit', 1);
            tr.queue(null);
            tr.resume();
        });
    }
    else if (cmd === 'echo') {
        tr.queue(args.join(' ') + '\n');
        process.nextTick(function () {
            tr.queue(null);
            tr.resume();
        });
    }
    
    return tr;
}
