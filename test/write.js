var test = require('tap').test;
var bash = require('../');

var through = require('through');
var concat = require('concat-stream');
var fs = require('fs');
var spawn = require('child_process').spawn;

var path = require('path');
var mkdirp = require('mkdirp');
var tempfile = path.join(
    require('os').tmpDir(),
    'bashful-test',
    Math.floor(Math.pow(16,8)*Math.random()).toString(16)
);
mkdirp.sync(path.dirname(tempfile));

test('echo > file', function (t) {
    t.plan(2);
    
    var sh = bash({
        spawn: spawn,
        write: fs.createWriteStream
    });
    
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

test('echo | wc -c > file', function (t) {
    t.plan(1);
    
    var sh = bash({
        spawn: spawn,
        write: fs.createWriteStream
    });
    
    var s = sh.createStream();
    s.pipe(concat(function (err, src) {
        t.equal(
            fs.readFileSync(tempfile, 'utf8'),
            '10\n'
        );
    }));
    s.write('echo beep boop | wc -c > ' + tempfile + '\n');
    s.end();
});

test('pwd; echo | wc -c > file', function (t) {
    t.plan(2);
    
    var sh = bash({
        spawn: spawn,
        write: fs.createWriteStream
    });
    
    var s = sh.createStream();
    s.pipe(concat(function (err, src) {
        t.equal(
            fs.readFileSync(tempfile, 'utf8'),
            '10\n'
        );
        t.equal(src, [
            '$ ' + process.cwd(),
            '$ 10',
            '$ '
        ].join('\n'));
    }));
    s.write('pwd; echo beep boop | wc -c > ' + tempfile + '\n');
    s.write('cat ' + tempfile + '\n');
    s.end();
});

test('echo | wc -c > file; pwd', function (t) {
    t.plan(2);
    
    var sh = bash({
        spawn: spawn,
        write: fs.createWriteStream
    });
    
    var s = sh.createStream();
    s.pipe(concat(function (err, src) {
        t.equal(
            fs.readFileSync(tempfile, 'utf8'),
            '10\n'
        );
        t.equal(src, [
            '$ ' + process.cwd(),
            '$ 10',
            '$ '
        ].join('\n'));
    }));
    s.write('echo beep boop | wc -c > ' + tempfile + '; pwd\n');
    s.write('cat ' + tempfile + '\n');
    s.end();
});

test('true > file && echo PASS', function (t) {
    t.plan(2);
    
    var sh = bash({
        spawn: spawn,
        write: fs.createWriteStream
    });
    
    var s = sh.createStream();
    s.pipe(concat(function (err, src) {
        t.equal(fs.readFileSync(tempfile, 'utf8'), '');
        t.equal(src, '$ PASS\n$ ');
    }));
    s.write('true > ' + tempfile + ' && echo PASS\n');
    s.end();
});

test('false > file && echo PASS', function (t) {
    t.plan(2);
    
    var sh = bash({
        spawn: spawn,
        write: fs.createWriteStream
    });
    
    var s = sh.createStream();
    s.pipe(concat(function (err, src) {
        t.equal(fs.readFileSync(tempfile, 'utf8'), '');
        t.equal(src, '$ $ ');
    }));
    s.write('false > ' + tempfile + ' && echo PASS\n');
    s.end();
});

test('true > file || echo PASS', function (t) {
    t.plan(2);
    
    var sh = bash({
        spawn: spawn,
        write: fs.createWriteStream
    });
    
    var s = sh.createStream();
    s.pipe(concat(function (err, src) {
        t.equal(fs.readFileSync(tempfile, 'utf8'), '');
        t.equal(src, '$ $ ');
    }));
    s.write('true > ' + tempfile + ' || echo PASS\n');
    s.end();
});

test('false > file || echo PASS', function (t) {
    t.plan(2);
    
    var sh = bash({
        spawn: spawn,
        write: fs.createWriteStream
    });
    
    var s = sh.createStream();
    s.pipe(concat(function (err, src) {
        t.equal(fs.readFileSync(tempfile, 'utf8'), '');
        t.equal(src, '$ PASS\n$ ');
    }));
    s.write('false > ' + tempfile + ' || echo PASS\n');
    s.end();
});
