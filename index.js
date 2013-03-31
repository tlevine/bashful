var split = require('split');
var through = require('through');
var duplexer = require('duplexer');
var shellQuote = require('shell-quote');
var shellExpand = require('./expand');

module.exports = Bash;

function Bash (env) {
    if (!(this instanceof Bash)) return new Bash(env);
    this.env = env || {};
    if (this.env.PS1 === undefined) this.env.PS1 = '$ ';
}

Bash.prototype.createStream = function () {
    var self = this;
    var sp = split();
    sp.on('end', function () { output.queue(null) });
    
    var output = through();
    process.nextTick(function () {
        output.queue(self.env.PS1);
    });
    
    sp.pipe(through(function (line) {
        var p = self.exec(line);
        p.pipe(output, { end: false });
        p.on('end', function () {
            output.queue(self.env.PS1);
        });
    }));
    return duplexer(sp, output);
};

Bash.prototype.exec = function (line) {
    var self = this;
    if (!/\S+/.test(line)) {
        return builtins.echo.call(self, [ '-n' ]);
    }
    
    var parts = shellQuote.parse(shellExpand(line, self.env));
    var cmd = parts[0], args = parts.slice(1);
    if (builtins[cmd]) {
        return builtins[cmd].call(self, args);
    }
    else {
        return builtins.echo.call(self, [
            'No command "' + cmd + '" found'
        ]);
    }
};

var builtins = Bash.builtins = {};
builtins.exec = Bash.prototype.exec;
builtins.echo = function (args) {
    var tr = through();
    var opts = { newline: true, 'escape': false };
    for (var i = 0; i < args.length; i++) {
        if (args[i] === '-n') {
            opts.newline = false;
            args.splice(i--, 1);
        }
        else if (args[i] === '-e') {
            opts['escape'] = true;
            args.splice(i--, 1);
        }
        else if (args[i] === '-E') {
            opts['escape'] = false;
            args.splice(i--, 1);
        }
    }
    
    process.nextTick(function () {
        if (args.length) tr.queue(args.join(' '));
        if (opts.newline) tr.queue('\n');
        tr.queue(null);
    });
    return tr;
};
