var split = require('split');
var through = require('through');
var duplexer = require('duplexer');
var shellQuote = require('shell-quote');
var shellExpand = require('./lib/expand');

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');

module.exports = Bash;

function Bash (env) {
    if (!(this instanceof Bash)) return new Bash(env);
    this.env = env || {};
    if (this.env.PS1 === undefined) this.env.PS1 = '$ ';
}

inherits(Bash, EventEmitter);

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
        if (p.stdout) {
            p.stdout.pipe(output, { end: false });
            p.on('exit', function () {
                output.queue(self.env.PS1);
            });
        }
        else {
            p.pipe(output, { end: false });
            p.on('end', function () {
                output.queue(self.env.PS1);
            });
        }
    }));
    return duplexer(sp, output);
};

Bash.prototype.emit = function (name) {
    var self = this;
    var args = [].slice.call(arguments, 1);
    var res;
    this.listeners(name).forEach(function (fn) {
        res = res || fn.apply(self, args);
    });
    return res;
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
    
    var res = self.emit('command', cmd, args, {
        env: self.env,
        cwd: self.env.PWD
    });
    if (res) return res;
    
    return builtins.echo.call(self, [
        'No command "' + cmd + '" found'
    ]);
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
