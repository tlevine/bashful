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

test('echo > file', function (t) {
    t.plan(2);
    
    var sh = bash();
    sh.on('command', spawn);
    sh.on('write', fs.createWriteStream);
    
    var s = sh.createStream();
    s.pipe(concat(function (err, src) {
        t.equal(
            fs.readFileSync(tempfile, 'utf8'),
            'beep boop\n'
        );
        t.equal(src, [
            '$ $ beep boop',
            '$ '
        ].join('\n'));
    }));
    s.write('echo beep boop > ' + tempfile + '\n');
    s.write('cat ' + tempfile + '\n');
    s.end();
});
