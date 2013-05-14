var test = require('tap').test;
var bash = require('../');

var through = require('through');
var concat = require('concat-stream');
var fs = require('fs');
var spawn = require('child_process').spawn;

var path = require('path');
var mkdirp = require('mkdirp');
var tempfile = path.join(require('os').tmpDir(), 'bashful-test', Math.random());
mkdirp.sync(path.dirname(tempfile));

test('run', function (t) {
    t.plan(1);
    
    var sh = bash();
    sh.on('command', spawn);
    sh.on('write', fs.createWriteStream);
    
    var s = sh.createStream();
    s.pipe(concat(function (err, src) {
        t.equal(src, [
            '$ $ beep boop',
            '$ '
        ].join('\n'));
    }));
    s.write('echo beep boop > ' + tempfile + '\n');
    s.write('cat ' + tempfile + '\n');
    s.end();
});

function run (cmd, args) {
    if (cmd === 'wc' && args[0] === '-c') {
        var count = 0;
        var write = function (buf) { count += buf.length };
        var end = function () {
            this.queue(count + '\n');
            this.queue(null);
        };
        var tr = through(write, end);
        return tr;
    }
}
