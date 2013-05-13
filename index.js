var split = require('split');
var through = require('through');
var duplexer = require('duplexer');
var shellQuote = require('shell-quote');
var shellExpand = require('./lib/expand');

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var nextTick = typeof setImmediate === 'function'
    ? setImmediate : process.nextTick
;

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
    
    var output = resumer();
    output.queue(self.env.PS1);
    
    sp.pipe(through(write, end));
    return duplexer(sp, output);
    function write (line) {
        var p = self.exec(line);
        sp.pause();
        p.on('data', function () {});
        p.on('end', function () {
            output.queue(self.env.PS1);
            sp.resume();
        });
        p.pipe(output, { end: false });
    }
    function end () { output.queue(null) }
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
    var output = resumer();
    
    var parts = shellQuote.parse(line, self.env);
    var commands = [ { op: ';', args: [] } ];
    
    for (var i = 0; i < parts.length; i++) {
        if (typeof parts[i] === 'object') {
            commands.push({ op: parts[i].op, args: [] });
        }
        else {
            var cmd = commands[commands.length-1];
            if (cmd.command === undefined) cmd.command = parts[i];
            else cmd.args.push(parts[i]);
        }
    }
    
    (function run (code) {
        var c = commands.shift();
        if (!c) return output.queue(null);
        var cmd = c.command;
        var args = c.args;
        var op = c.op;
        
        if (op === '&&' && code !== 0) {
            return run(1);
        }
        if (op === '||' && code === 0) {
            return run(1);
        }
        
        if (builtins[cmd]) {
            var b = builtins[cmd].call(self, args);
            b.on('data', function () {});
            b.on('end', function () {
                output.queue(null);
            });
            b.pipe(output, { end: false });
            return;
        }
        
        var res = self.emit('command', cmd, args, {
            env: self.env,
            cwd: self.env.PWD
        });
        if (res && (res.stdout || res.stderr)) {
            if (res.stdout) res.stdout.pipe(output, { end: false });
            if (res.stderr) res.stderr.pipe(output, { end: false });
            res.on('close', run);
        }
        else if (res) {
            res.on('data', function () {});
            var exit = 0;
            res.on('error', function () { exit = 1 });
            res.on('end', function () {
                nextTick(function () { run(exit) });
            });
            res.on('exit', function (ecode) { exit = ecode });
            res.pipe(output, { end: false });
        }
        else {
            output.queue('No command "' + cmd + '" found\n');
            run(1);
        }
    })(0);
    
    return output;
};

var builtins = Bash.builtins = {};
builtins.exec = Bash.prototype.exec;
builtins.echo = function (args) {
    var tr = resumer();
    
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
    
    if (args.length) tr.queue(args.join(' '));
    if (opts.newline) tr.queue('\n');
    tr.queue(null);
    
    return tr;
};

function resumer () {
    var tr = through();
    tr.pause();
    var resume = tr.resume;
    var pause = tr.pause;
    var paused = false;
    
    tr.pause = function () {
        paused = true;
        return pause.apply(this, arguments);
    };
    
    tr.resume = function () {
        paused = false;
        return resume.apply(this, arguments);
    };
    
    nextTick(function () {
        if (!paused) tr.resume();
    });
    
    return tr;
}
