var resumer = require('resumer');
var nextTick = require('../next_tick.js');

module.exports = function (args) {
    var env = this.env;
    var dir = args[0] === undefined ? env.HOME : args[0];
    var edir = dir.replace(/^~\//, function () { return env.HOME + '/' });
    edir = path.resolve(env.PWD, edir);
    
    var tr = resumer();
    if (this._exists) this._exists(edir, onexists);
    else nextTick(function () { onexists(false) });
    
    return tr;
    
    function onexists (ex) {
        if (ex) {
            env.PWD = edir;
            tr.emit('exit', 0);
            tr.queue(null);
        }
        else {
            tr.queue('cd: ' + dir + ': No such file or directory\n');
            tr.emit('exit', 1);
            tr.queue(null);
        }
    }
};
