module.exports = function (line, env) {
    var result = '';
    var state = 'accept';
    var name;
    
    for (var i = 0; i < line.length; i++) {
        var x = line.charAt(i);
        if (state === 'accept') {
            if (x === '$') {
                state = 'name';
                name = '';
            }
            else if (x === '\\') {
                state = 'escape';
            }
            else result += x;
        }
        else if (state === 'escape') {
            result += x;
            state = 'accept';
        }
        else if (state === 'name') {
            if (/\w/.test(x)) name += x;
            else {
                result += env[name] === undefined ? '' : env[name];
                result += x;
                name = '';
                state = 'accept';
            }
        }
        else result += x;
    }
    if (state === 'name') {
        result += env[name] === undefined ? '' : env[name];
    }
    return result;
};
