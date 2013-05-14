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

test('wc -c < file', function (t) {
    t.plan(1);
    
    var sh = bash();
    sh.on('command', spawn);
    sh.on('read', fs.createReadStream);
    
    fs.writeFileSync(tempfile, 'beep boop\n');
    
    var s = sh.createStream();
    s.pipe(concat(function (err, src) {
        t.equal(src, '$ 10\n$ ');
    }));
    s.write('wc -c < ' + tempfile + '\n');
    s.end();
});
