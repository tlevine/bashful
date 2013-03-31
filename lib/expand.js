module.exports = function (line, env) {
    var result = '';
    var state = 'accept';
    var name;
    
    for (var i = 0; i < line.length; i++) {
        var x = line.charAt(i);
        if (state === 'accept' || state === 'double') {
            if (x === '$') {
                state = 'name';
                name = '';
            }
            else if (x === '\\') {
                state = 'escape';
            }
            else if (x === "'" && state !== 'double') {
                state = 'single';
                result += x;
            }
            else if (x === '"') {
                state = state === 'double' ? 'accept' : 'double';
                result += x;
            }
            else result += x;
        }
        else if (state === 'single') {
            if (x === '\\') {
                state = 'single-escape';
            }
            else if (x === "'") {
                state = 'accept';
                result += x;
            }
            else result += x;
        }
        else if (state === 'escape') {
            result += x;
            state = 'accept';
        }
        else if (state === 'single-escape') {
            if (x === "'") result += x;
            else result += '\\' + x;
            state = 'single';
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
