var test = require('tap').test;
var bash = require('../');
var through = require('through');
var concat = require('concat-stream');

test('set env vars', function (t) {
    t.plan(1);
    
    var sh = bash({ spawn: run, env: { X: 3 } });
    
    var s = sh.createStream();
    s.pipe(concat(function (err, src) {
        t.equal(src, [
            '$ 3',
            '$ 5',
            '$ 3',
            '$ 2'
        ].join('\n'));
    }));
    s.write('printx; X=5 printx; printx; X=2; printx\n');
    s.end();
});

function run (cmd, args, opts) {
    if (cmd === 'printx') {
        return through(null, function () {
            this.queue(args[0] + '\n');
            this.queue(null);
        });
    }
}
