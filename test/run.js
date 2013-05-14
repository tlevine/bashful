var test = require('tap').test;
var bash = require('../');
var through = require('through');
var concat = require('concat-stream');

test('run', function (t) {
    t.plan(1);
    
    var sh = bash({
        env: { XYZ: 'abcdefg' },
        command: run
    });
    
    var s = sh.createStream();
    s.pipe(concat(function (err, src) {
        t.equal(src, [
            '$ /home/test',
            '$ boop',
            '$ abcdefg',
            '$ '
        ].join('\n'));
    }));
    s.write('pwd\n');
    s.write('beep\n');
    s.write('echo $XYZ\n');
    s.end();
});

function run (cmd, args) {
    var tr = through();
    tr.pause();
    tr.queue({
        'pwd': '/home/test\n',
        'beep': 'boop\n',
        'echo': args.join(' ') + '\n'
    }[cmd]);
    tr.queue(null);
    
    process.nextTick(function () {
        tr.resume();
    });
    return tr;
}
