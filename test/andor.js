var test = require('tap').test;
var bash = require('../');
var through = require('through');
var concat = require('concat-stream');
var nextTick = typeof setImmediate !== 'undefined'
    ? setImmediate : process.nextTick
;

test('true and', function (t) {
    t.plan(1);
    
    var sh = bash({
        env: { XYZ: 'abcdefg' },
        custom: [ 'true', 'false' ],
        command: run
    });
    
    var s = sh.createStream();
    s.pipe(concat(function (err, src) {
        t.equal(src, [
            '$ TRUE',
            'abcdefg',
            '$ '
        ].join('\n'));
    }));
    s.end('true && echo $XYZ\n');
});

test('false and', function (t) {
    t.plan(1);
    
    var sh = bash({
        env: { XYZ: 'abcdefg' },
        custom: [ 'true', 'false' ],
        command: run
    });
    
    var s = sh.createStream();
    s.pipe(concat(function (err, src) {
        t.equal(src, [
            '$ FALSE',
            '$ '
        ].join('\n'));
    }));
    s.end('false && echo $XYZ\n');
});

test('false or', function (t) {
    t.plan(1);
    
    var sh = bash({
        env: { XYZ: 'abcdefg' },
        custom: [ 'true', 'false' ],
        command: run
    });
    
    var s = sh.createStream();
    s.pipe(concat(function (err, src) {
        t.equal(src, [
            '$ FALSE',
            'abcdefg',
            '$ '
        ].join('\n'));
    }));
    s.end('false || echo $XYZ\n');
});

test('true or', function (t) {
    t.plan(1);
    
    var sh = bash({
        env: { XYZ: 'abcdefg' },
        custom: [ 'true', 'false' ],
        command: run
    });
    
    var s = sh.createStream();
    s.pipe(concat(function (err, src) {
        t.equal(src, [
            '$ TRUE',
            '$ '
        ].join('\n'));
    }));
    s.end('true || echo $XYZ\n');
});

test('false and true or', function (t) {
    t.plan(1);
    
    var sh = bash({
        env: { XYZ: 'abcdefg' },
        custom: [ 'true', 'false' ],
        command: run
    });
    
    var s = sh.createStream();
    s.pipe(concat(function (err, src) {
        t.equal(src, [
            '$ FALSE',
            'abcdefg',
            '$ '
        ].join('\n'));
    }));
    s.end('false && true || echo $XYZ\n');
});

test('false or true and', function (t) {
    t.plan(1);
    
    var sh = bash({
        env: { XYZ: 'abcdefg' },
        custom: [ 'true', 'false' ],
        command: run
    });
    
    var s = sh.createStream();
    s.pipe(concat(function (err, src) {
        t.equal(src, [
            '$ FALSE',
            'TRUE',
            'abcdefg',
            '$ '
        ].join('\n'));
    }));
    s.end('false || true && echo $XYZ\n');
});

test('false or false and', function (t) {
    t.plan(1);
    
    var sh = bash({
        env: { XYZ: 'abcdefg' },
        custom: [ 'true', 'false' ],
        command: run
    });
    
    var s = sh.createStream();
    s.pipe(concat(function (err, src) {
        t.equal(src, [
            '$ FALSE',
            'FALSE',
            '$ '
        ].join('\n'));
    }));
    s.end('false || false && echo $XYZ\n');
});

function run (cmd, args) {
    var tr = through();
    tr.pause();
    if (cmd === 'true') {
        tr.queue('TRUE\n');
        process.nextTick(function () {
            tr.emit('exit', 0);
            tr.queue(null);
            tr.resume();
        });
    }
    else if (cmd === 'false') {
        tr.queue('FALSE\n');
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
