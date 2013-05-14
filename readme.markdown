# bashful

Parse and execute bash in javascript without doing any IO
so you can use your own IO backend.

[![build status](https://secure.travis-ci.org/substack/bashful.png)](http://travis-ci.org/substack/bashful)

# example

``` js
var bash = require('bashful');
var fs = require('fs');

var sh = bash({
    env: process.env,
    spawn: require('child_process').spawn,
    write: fs.createWriteStream,
    read: fs.createReadStream
});

var s = sh.createStream();
process.stdin.pipe(s).pipe(process.stdout);
```

```
$ echo hello
hello
$ echo $PWD
/home/substack/projects/bashful
$ beep boop
No command "beep" found
$ echo beep boop | wc -c
10
$ false || true && echo bleep
bleep
$ echo ONE TWO THREE > outfile.txt
$ cat outfile.txt
ONE TWO THREE
$ wc -c < outfile.txt
14
```

# methods

``` js
var bash = require('bashful')
```

## bash.createStream()

Create a duplex stream for the interpreter.

# events

## bash.on('command', function cb (cmd, args, opts) {})

When the stream parses a non-builtin command, this event fires with the command
`cmd`, its arguments `args` and the `opts.env` and `opts.cwd` of the current
bash instance that can be passed directly into node core's
`child_process.spawn()`.

If the `cb` listener wants to provide an implementation of the command `cmd`, it
should return a duplex stream or an object with `"stdin"`, `"stdout"`, and
optionally `"stderr"` streams.

# status

The scope of this module is to only support the internally-defined bash
functions you can list by typing `help` in a real bash shell.

## implemented

* `&&`, `;`, `||`, `|`
* `$?`
* `echo [-neE] [arg ...]`
* `eval [arg ...]`
* `false`
* `filename [arguments]`
* `true`

## not yet implemented

* `job_spec [&]`
* `(( expression ))`
* `. filename [arguments]`
* `:`
* `[ arg... ]`
* `[[ expression ]]`
* `alias [-p] [name[=value] ... ]`
* `bg [job_spec ...]`
* `bind [-lpvsPVS] [-m keymap] [-f filen>`
* `break [n]`
* `builtin [shell-builtin [arg ...]]`
* `caller [expr]`
* `case WORD in [PATTERN [| PATTERN]...)>`
* `cd [-L|[-P [-e]]] [dir]`
* `command [-pVv] command [arg ...]`
* `compgen [-abcdefgjksuv] [-o option]  >`
* `complete [-abcdefgjksuv] [-pr] [-DE] >`
* `compopt [-o|+o option] [-DE] [name ..>`
* `continue [n]`
* `coproc [NAME] command [redirections]`
* `declare [-aAfFgilrtux] [-p] [name[=va>`
* `dirs [-clpv] [+N] [-N]`
* `disown [-h] [-ar] [jobspec ...]`
* `enable [-a] [-dnps] [-f filename] [na>`
* `exec [-cl] [-a name] [command [argume>`
* `exit [n]`
* `export [-fn] [name[=value] ...] or ex>`
* `fc [-e ename] [-lnr] [first] [last] o>`
* `fg [job_spec]`
* `for NAME [in WORDS ... ] ; do COMMAND>`
* `for (( exp1; exp2; exp3 )); do COMMAN>`
* `function name { COMMANDS ; } or name >`
* `getopts optstring name [arg]`
* `hash [-lr] [-p pathname] [-dt] [name >`
* `help [-dms] [pattern ...]`
* `history [-c] [-d offset] [n] or hist>`
* `if COMMANDS; then COMMANDS; [ elif C>`
* `jobs [-lnprs] [jobspec ...] or jobs >`
* `kill [-s sigspec | -n signum | -sigs>`
* `let arg [arg ...]`
* `local [option] name[=value] ...`
* `logout [n]`
* `mapfile [-n count] [-O origin] [-s c>`
* `popd [-n] [+N | -N]`
* `printf [-v var] format [arguments]`
* `pushd [-n] [+N | -N | dir]`
* `pwd [-LP]`
* `read [-ers] [-a array] [-d delim] [->`
* `readarray [-n count] [-O origin] [-s>`
* `readonly [-aAf] [name[=value] ...] o>`
* `return [n]`
* `select NAME [in WORDS ... ;] do COMM>`
* `set [-abefhkmnptuvxBCHP] [-o option->`
* `shift [n]`
* `shopt [-pqsu] [-o] [optname ...]`
* `source filename [arguments]`
* `suspend [-f]`
* `test [expr]`
* `time [-p] pipeline`
* `times`
* `trap [-lp] [[arg] signal_spec ...]`
* `type [-afptP] name [name ...]`
* `typeset [-aAfFgilrtux] [-p] name[=va>`
* `ulimit [-SHacdefilmnpqrstuvx] [limit>`
* `umask [-p] [-S] [mode]`
* `unalias [-a] name [name ...]`
* `unset [-f] [-v] [name ...]`
* `until COMMANDS; do COMMANDS; done`
* `variables - Names and meanings of so>`
* `wait [id]`
* `while COMMANDS; do COMMANDS; done`
* `{ COMMANDS ; }`
