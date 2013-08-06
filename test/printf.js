var test = require('tap').test;
var bash = require('../');
var through = require('through');
var concat = require('concat-stream');

test('printf with one argument', function (t) {
    t.plan(2);
    
    var sh = bash({
        spawn: function (cmd) { t.fail('spawn ' + cmd) },
        env: {
            PS1: '$ ',
            PWD: '/beep/boop',
            HOME: '/home/robot'
        },
        exists: function (file, cb) {
            t.equal(file, '/home/robot');
            cb(file === '/home/robot');
        }
    });
    
    var s = sh.createStream();
    s.pipe(concat(function (err, src) {
        t.equal(src, 'foo');
    }));
    s.end('printf foo');
});

test('printf sans arguments', function (t) {
    t.plan(2);
    
    var sh = bash({
        spawn: function (cmd) { t.fail('spawn ' + cmd) },
        env: {
            PS1: '$ ',
            PWD: '/beep/boop',
            HOME: '/home/robot'
        },
        exists: function (file, cb) {
            t.equal(file, '/home/robot');
            cb(file === '/home/robot');
        }
    });
    
    var s = sh.createStream();
    s.pipe(concat(function (err, src) {
        t.equal(src, 'printf: usage: printf [-v var] format [arguments]');
    }));
    s.end('printf');
});

function run (cmd, args) {
    if (cmd === 'printf') {
        var tr = resumer();
        tr.queue('boop\n');
        tr.queue(null);
        return tr;
    }
}
