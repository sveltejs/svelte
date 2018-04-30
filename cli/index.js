'use strict';

const EQQ = /\s|=/;
const FLAG = /^-{1,2}/;
const PREFIX = /^--no-/i;

function isBool(any) {
	return typeof any === 'boolean';
}

function toArr(any) {
	return Array.isArray(any) ? any : any == null ? [] : [any];
}

function toString(any) {
	return any == null || any === true ? '' : String(any);
}

function toBool(any) {
	return any === 'false' ? false : Boolean(any);
}

function toNum(any) {
	return (!isBool(any) && Number(any)) || any;
}

function getAlibi(names, arr) {
	if (arr.length === 0) return arr;
	let k, i = 0, len = arr.length, vals = [];
	for (; i < len; i++) {
		k = arr[i];
		vals.push(k);
		if (names[k] !== void 0) {
			vals = vals.concat(names[k]);
		}
	}
	return vals;
}

function typecast(key, val, strings, booleans) {
	if (strings.indexOf(key) !== -1) return toString(val);
	if (booleans.indexOf(key) !== -1) return toBool(val);
	return toNum(val);
}

var lib = function(args, opts) {
	args = args || [];
	opts = opts || {};

	opts.string = toArr(opts.string);
	opts.boolean = toArr(opts.boolean);

	const aliases = {};
	let k, i, j, x, y, len, type;

	if (opts.alias !== void 0) {
		for (k in opts.alias) {
			aliases[k] = toArr(opts.alias[k]);
			len = aliases[k].length; // save length
			for (i = 0; i < len; i++) {
				x = aliases[k][i]; // alias's key name
				aliases[x] = [k]; // set initial array
				for (j = 0; j < len; j++) {
					if (x !== aliases[k][j]) {
						aliases[x].push(aliases[k][j]);
					}
				}
			}
		}
	}

	if (opts.default !== void 0) {
		for (k in opts.default) {
			type = typeof opts.default[k];
			opts[type] = (opts[type] || []).concat(k);
		}
	}

	// apply to all aliases
	opts.string = getAlibi(aliases, opts.string);
	opts.boolean = getAlibi(aliases, opts.boolean);

	let idx = 0;
	const out = { _: [] };

	while (args[idx] !== void 0) {
		let incr = 1;
		const val = args[idx];

		if (val === '--') {
			out._ = out._.concat(args.slice(idx + 1));
			break;
		} else if (!FLAG.test(val)) {
			out._.push(val);
		} else if (PREFIX.test(val)) {
			out[val.replace(PREFIX, '')] = false;
		} else {
			let tmp;
			const segs = val.split(EQQ);
			const isGroup = segs[0].charCodeAt(1) !== 45; // '-'

			const flag = segs[0].substr(isGroup ? 1 : 2);
			len = flag.length;
			const key = isGroup ? flag[len - 1] : flag;

			if (opts.unknown !== void 0 && aliases[key] === void 0) {
				return opts.unknown(segs[0]);
			}

			if (segs.length > 1) {
				tmp = segs[1];
			} else {
				tmp = args[idx + 1] || true;
				FLAG.test(tmp) ? (tmp = true) : (incr = 2);
			}

			if (isGroup && len > 1) {
				for (i = len - 1; i--; ) {
					k = flag[i]; // all but last key
					out[k] = typecast(k, true, opts.string, opts.boolean);
				}
			}

			const value = typecast(key, tmp, opts.string, opts.boolean);
			out[key] = out[key] !== void 0 ? toArr(out[key]).concat(value) : value;

			// handle discarded args when dealing with booleans
			if (isBool(value) && !isBool(tmp) && tmp !== 'true' && tmp !== 'false') {
				out._.push(tmp);
			}
		}

		idx += incr;
	}

	if (opts.default !== void 0) {
		for (k in opts.default) {
			if (out[k] === void 0) {
				out[k] = opts.default[k];
			}
		}
	}

	for (k in out) {
		if (aliases[k] === void 0) continue;
		y = out[k];
		len = aliases[k].length;
		for (i = 0; i < len; i++) {
			out[aliases[k][i]] = y; // assign value
		}
	}

	return out;
};

var lib$1 = /*#__PURE__*/Object.freeze({
	default: lib,
	__moduleExports: lib
});

/*!
 * repeat-string <https://github.com/jonschlinkert/repeat-string>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

/**
 * Results cache
 */

var res = '';
var cache;

/**
 * Expose `repeat`
 */

var repeatString = repeat;

/**
 * Repeat the given `string` the specified `number`
 * of times.
 *
 * **Example:**
 *
 * ```js
 * var repeat = require('repeat-string');
 * repeat('A', 5);
 * //=> AAAAA
 * ```
 *
 * @param {String} `string` The string to repeat
 * @param {Number} `number` The number of times to repeat the string
 * @return {String} Repeated string
 * @api public
 */

function repeat(str, num) {
  if (typeof str !== 'string') {
    throw new TypeError('expected a string');
  }

  // cover common, quick use cases
  if (num === 1) return str;
  if (num === 2) return str + str;

  var max = str.length * num;
  if (cache !== str || typeof cache === 'undefined') {
    cache = str;
    res = '';
  } else if (res.length >= max) {
    return res.substr(0, max);
  }

  while (max > res.length && num > 1) {
    if (num & 1) {
      res += str;
    }

    num >>= 1;
    str += str;
  }

  res += str;
  res = res.substr(0, max);
  return res;
}

var repeatString$1 = /*#__PURE__*/Object.freeze({
	default: repeatString,
	__moduleExports: repeatString
});

var repeat$1 = ( repeatString$1 && repeatString ) || repeatString$1;

var padRight = function padLeft(val, num, str) {
  var padding = '';
  var diff = num - val.length;

  // Breakpoints based on benchmarks to use the fastest approach
  // for the given number of zeros
  if (diff <= 5 && !str) {
    padding = '00000';
  } else if (diff <= 25 && !str) {
    padding = '000000000000000000000000000';
  } else {
    return val + repeat$1(str || '0', diff);
  }

  return val + padding.slice(0, diff);
};

var padRight$1 = /*#__PURE__*/Object.freeze({
	default: padRight,
	__moduleExports: padRight
});

var rpad = ( padRight$1 && padRight ) || padRight$1;

const GAP = 4;
const __ = '  ';
const ALL = '__all__';
const DEF = '__default__';
const NL = '\n';

function format(arr) {
	if (!arr.length) return '';
	let len = maxLen( arr.map(x => x[0]) ) + GAP;
	let join = a => rpad(a[0], len, ' ') + a[1] + (a[2] == null ? '' : `  (default ${a[2]})`);
	return arr.map(join);
}

function maxLen(arr) {
  let c=0, d=0, l=0, i=arr.length;
  if (i) while (i--) {
    d = arr[i].length;
    if (d > c) {
      l = i; c = d;
    }
  }
  return arr[l].length;
}

function noop(s) {
	return s;
}

function section(str, arr, fn) {
	if (!arr || !arr.length) return '';
	let i=0, out='';
	out += (NL + __ + str);
	for (; i < arr.length; i++) {
		out += (NL + __ + __ + fn(arr[i]));
	}
	return out + NL;
}

var help = function (bin, tree, key) {
	let out='', cmd=tree[key], pfx=`$ ${bin}`, all=tree[ALL];
	let prefix = s => `${pfx} ${s}`;

	// update ALL & CMD options
	all.options.push(['-h, --help', 'Displays this message']);
	cmd.options = (cmd.options || []).concat(all.options);

	// write options placeholder
	(cmd.options.length > 0) && (cmd.usage += ' [options]');

	// description ~> text only; usage ~> prefixed
	out += section('Description', cmd.describe, noop);
	out += section('Usage', [cmd.usage], prefix);

	if (key === DEF) {
		// General help :: print all non-internal commands & their 1st line of text
		let cmds = Object.keys(tree).filter(k => !/__/.test(k));
		let text = cmds.map(k => [k, (tree[k].describe || [''])[0]]);
		out += section('Available Commands', format(text), noop);

		out += (NL + __ + 'For more info, run any command with the `--help` flag');
		cmds.slice(0, 2).forEach(k => {
			out += (NL + __ + __ + `${pfx} ${k} --help`);
		});
		out += NL;
	}

	out += section('Options', format(cmd.options), noop);
	out += section('Examples', cmd.examples.map(prefix), noop);

	return out;
};

var error = function (bin, str, num=1) {
	let out = section('ERROR', [str], noop);
	out += (NL + __ + `Run \`$ ${bin} --help\` for more info.` + NL);
	console.error(out);
	process.exit(num);
};

// Strips leading `-|--` & extra space(s)
var parse = function (str) {
	return (str || '').split(/^-{1,2}|,|\s+-{1,2}|\s+/).filter(Boolean);
};

// @see https://stackoverflow.com/a/18914855/3577474
var sentences = function (str) {
	return (str || '').replace(/([.?!])\s*(?=[A-Z])/g, '$1|').split('|');
};

var utils = {
	help: help,
	error: error,
	parse: parse,
	sentences: sentences
};

var utils$1 = /*#__PURE__*/Object.freeze({
	default: utils,
	__moduleExports: utils,
	help: help,
	error: error,
	parse: parse,
	sentences: sentences
});

var mri = ( lib$1 && lib ) || lib$1;

var $ = ( utils$1 && utils ) || utils$1;

const ALL$1 = '__all__';
const DEF$1 = '__default__';

class Sade {
	constructor(name) {
		this.tree = {};
		this.name = name;
		this.ver = '0.0.0';
		this.default = '';
		// set internal shapes;
		this.command(ALL$1);
		this.command(`${DEF$1} <command>`)
			.option('-v, --version', 'Displays current version');
		this.curr = ''; // reset
	}

	command(str, desc, opts) {
		let cmd=[], usage=[], rgx=/(\[|<)/;
		// All non-([|<) are commands
		str.split(/\s+/).forEach(x => {
			(rgx.test(x.charAt(0)) ? usage : cmd).push(x);
		});

		// Back to string~!
		cmd = cmd.join(' ');

		if (cmd in this.tree) {
			throw new Error(`Command already exists: ${cmd}`);
		}

		this.curr = cmd;
		(opts && opts.default) && (this.default=cmd);

		!~cmd.indexOf('__') && usage.unshift(cmd); // re-include `cmd`
		usage = usage.join(' '); // to string

		this.tree[cmd] = { usage, options:[], alias:{}, default:{}, examples:[] };
		desc && this.describe(desc);

		return this;
	}

	describe(str) {
		this.tree[this.curr || DEF$1].describe = Array.isArray(str) ? str : $.sentences(str);
		return this;
	}

	option(str, desc, val) {
		let cmd = this.tree[ this.curr || ALL$1 ];

		let [flag, alias] = $.parse(str);
		(alias && alias.length > 1) && ([flag, alias]=[alias, flag]);

		str = `--${flag}`;
		if (alias && alias.length > 0) {
			str = `-${alias}, ${str}`;
			let old = cmd.alias[alias];
			cmd.alias[alias] = (old || []).concat(flag);
		}

		let arr = [str, desc || ''];

		if (val !== void 0) {
			arr.push(val);
			cmd.default[flag] = val;
		}

		cmd.options.push(arr);
		return this;
	}

	action(handler) {
		this.tree[ this.curr || DEF$1 ].handler = handler;
		return this;
	}

	example(str) {
		this.tree[ this.curr || DEF$1 ].examples.push(str);
		return this;
	}

	version(str) {
		this.ver = str;
		return this;
	}

	parse(arr, opts={}) {
		let offset = 2; // argv slicer
		let alias = { h:'help', v:'version' };
		let argv = mri(arr.slice(offset), { alias });
		let bin = this.name;

		// Loop thru possible command(s)
		let tmp, name='';
		let i=1, len=argv._.length + 1;
		for (; i < len; i++) {
			tmp = argv._.slice(0, i).join(' ');
			if (this.tree[tmp] !== void 0) {
				name=tmp; offset=(i + 2); // argv slicer
			}
		}

		let cmd = this.tree[name];
		let isVoid = (cmd === void 0);

		if (isVoid) {
			if (this.default) {
				name = this.default;
				cmd = this.tree[name];
				arr.unshift(name);
				offset++;
			} else if (name) {
				return $.error(bin, `Invalid command: ${name}`);
			} //=> else: cmd not specified, wait for now...
		}

		if (argv.version) {
			return console.log(`${bin}, ${this.ver}`);
		}

		if (argv.help) {
			return this.help(!isVoid && name);
		}

		if (cmd === void 0) {
			return $.error(bin, 'No command specified.');
		}

		let all = this.tree[ALL$1];
		// merge all objects :: params > command > all
		opts.alias = Object.assign(all.alias, cmd.alias, opts.alias);
		opts.default = Object.assign(all.default, cmd.default, opts.default);

		let vals = mri(arr.slice(offset), opts);
		let segs = cmd.usage.split(/\s+/);
		let reqs = segs.filter(x => x.charAt(0)==='<');
		let args = vals._.splice(0, reqs.length);

		if (args.length < reqs.length) {
			name && (bin += ` ${name}`); // for help text
			return $.error(bin, 'Insufficient arguments!');
		}

		segs.filter(x => x.charAt(0)==='[').forEach(_ => {
			args.push(vals._.pop()); // adds `undefined` per [slot] if no more
		});

		args.push(vals); // flags & co are last
		let handler = cmd.handler;
		return opts.lazy ? { args, name, handler } : handler.apply(null, args);
	}

	help(str) {
		console.log(
			$.help(this.name, this.tree, str || DEF$1)
		);
	}
}

var lib$2 = str => new Sade(str);

var version = "2.3.0";

const prog = lib$2('svelte-cli').version(version);

prog
	.command('compile <input>')

	.option('-o, --output', 'Output (if absent, prints to stdout)')
	.option('-f, --format', 'Type of output (amd, cjs, es, iife, umd)')
	.option('-g, --globals', 'Comma-separate list of `module ID:Global` pairs')
	.option('-n, --name', 'Name for IIFE/UMD export (inferred from filename by default)')
	.option('-m, --sourcemap', 'Generate sourcemap (`-m inline` for inline map)')
	.option('-d, --dev', 'Add dev mode warnings and errors')
	.option('--amdId', 'ID for AMD module (default is anonymous)')
	.option('--generate', 'Change generate format between `dom` and `ssr`')
	.option('--no-css', `Don't include CSS (useful with SSR)`)
	.option('--immutable', 'Support immutable data structures')

	.example('compile App.html > App.js')
	.example('compile src -o dest')
	.example('compile -f umd MyComponent.html > MyComponent.js')

	.action(async (input, opts) => {
		const { compile } = await Promise.resolve(require("./compile.js"));
		compile(input, opts);
	})

	.parse(process.argv);
