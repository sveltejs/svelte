'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var path = require('path');
var fs = require('fs');
var svelte = require('../compiler/svelte.js');

var ansi = (strip => ({
  reset: strip(["\x1b[0m"]),
  newLine: ["\n", ""],
  tab: ["\t", ""],

  black: strip(["\x1b[30m", "\x1b[39m"]),
  red: strip(["\x1b[31m", "\x1b[39m"]),
  green: strip(["\x1b[32m", "\x1b[39m"]),
  yellow: strip(["\x1b[33m", "\x1b[39m"]),
  blue: strip(["\x1b[34m", "\x1b[39m"]),
  magenta: strip(["\x1b[35m", "\x1b[39m"]),
  cyan: strip(["\x1b[36m", "\x1b[39m"]),
  white: strip(["\x1b[37m", "\x1b[39m"]),
  gray: strip(["\x1B[90m", "\x1b[39m"]),

  bgBlack: strip(["\x1b[40m", "\x1b[49m"]),
  bgRed: strip(["\x1b[41m", "\x1b[49m"]),
  bgGreen: strip(["\x1b[42m", "\x1b[49m"]),
  bgYellow: strip(["\x1b[43m", "\x1b[49m"]),
  bgBlue: strip(["\x1b[44m", "\x1b[49m"]),
  bgMagenta: strip(["\x1b[45m", "\x1b[49m"]),
  bgCyan: strip(["\x1b[46m", "\x1b[49m"]),
  bgWhite: strip(["\x1b[47m", "\x1b[49m"]),

  dim: strip(["\x1b[2m", "\x1b[22m"]),
  bold: strip(["\x1b[1m", "\x1b[22m"]),
  hidden: strip(["\x1b[8m", "\x1b[28m"]),
  italic: strip(["\x1b[3m", "\x1b[23m"]),
  underline: strip(["\x1b[4m", "\x1b[24m"]),
  inverse: strip(["\x1b[7m", "\x1b[27m"]),
  strikethrough: strip(["\x1b[9m", "\x1b[29m"])
}))(
  ansi =>
    process.env.FORCE_COLOR ||
    process.platform === "win32" ||
    (process.stdout.isTTY && process.env.TERM && process.env.TERM !== "dumb")
      ? ansi
      : ["", ""]
);

var ansi$1 = /*#__PURE__*/Object.freeze({
  default: ansi,
  __moduleExports: ansi
});

var ansi$2 = ( ansi$1 && ansi ) || ansi$1;

var clorox = (function Clorox(old, close) {
  const clorox = s => Clorox(clorox.toString(s));

  clorox.toString = s => old + (s || "") + (close || ansi$2.reset[0]);

  Object.keys(ansi$2).map(name => {
    Object.defineProperty(clorox, name, {
      get: () => Clorox(old + ansi$2[name][0], (close || "") + ansi$2[name][1])
    });
  });

  return clorox
})("");

function stderr(msg) {
	console.error(msg); // eslint-disable-line no-console
}

function error(err) {
	stderr(`${clorox.red(err.message || err)}`);

	if (err.frame) {
		stderr(err.frame); // eslint-disable-line no-console
	} else if (err.stack) {
		stderr(`${clorox.grey(err.stack)}`);
	}

	process.exit(1);
}

function mkdirp(dir) {
	const parent = path.dirname(dir);
	if (dir === parent) return;

	mkdirp(parent);
	if (!fs.existsSync(dir)) fs.mkdirSync(dir);
}

async function compile(input, opts) {
	if (opts._.length > 0) {
		error(`Can only compile a single file or directory`);
	}

	const output = opts.output;

	const stats = fs.statSync(input);
	const isDir = stats.isDirectory();

	if (isDir) {
		if (!output) {
			error(`You must specify an --output (-o) option when compiling a directory of files`);
		}

		if (opts.name || opts.amdId) {
			error(`Cannot specify --${opts.name ? 'name' : 'amdId'} when compiling a directory`);
		}
	}

	const globals = {};
	if (opts.globals) {
		opts.globals.split(',').forEach(pair => {
			const [key, value] = pair.split(':');
			globals[key] = value;
		});
	}

	const options = {
		name: opts.name,
		format: opts.format,
		sourceMap: opts.sourcemap,
		globals,
		css: opts.css !== false,
		dev: opts.dev,
		immutable: opts.immutable,
		generate: opts.generate || 'dom',
		customElement: opts.customElement,
		store: opts.store
	};

	if (isDir) {
		mkdirp(output);
		compileDirectory(input, output, options);
	} else {
		compileFile(input, output, options);
	}
}

function compileDirectory(input, output, options) {
	fs.readdirSync(input).forEach(file => {
		const src = path.resolve(input, file);
		const dest = path.resolve(output, file);

		if (path.extname(file) === '.html') {
			compileFile(
				src,
				dest.substring(0, dest.lastIndexOf('.html')) + '.js',
				options
			);
		} else {
			const stats = fs.statSync(src);
			if (stats.isDirectory()) {
				compileDirectory(src, dest, options);
			}
		}
	});
}

let SOURCEMAPPING_URL = 'sourceMa';
SOURCEMAPPING_URL += 'ppingURL';

function compileFile(input, output, options) {
	console.error(`compiling ${path.relative(process.cwd(), input)}...`); // eslint-disable-line no-console

	options = Object.assign({}, options);
	if (!options.name) options.name = getName(input);

	options.filename = input;
	options.outputFilename = output;

	const { sourceMap } = options;
	const inline = sourceMap === 'inline';

	let source = fs.readFileSync(input, 'utf-8');
	if (source[0] === 0xfeff) source = source.slice(1);

	let compiled;

	try {
		compiled = svelte.compile(source, options);
	} catch (err) {
		error(err);
	}

	const { js } = compiled;

	if (sourceMap) {
		js.code += `\n//# ${SOURCEMAPPING_URL}=${inline || !output
			? js.map.toUrl()
			: `${path.basename(output)}.map`}\n`;
	}

	if (output) {
		const outputDir = path.dirname(output);
		mkdirp(outputDir);
		fs.writeFileSync(output, js.code);
		console.error(`wrote ${path.relative(process.cwd(), output)}`); // eslint-disable-line no-console
		if (sourceMap && !inline) {
			fs.writeFileSync(`${output}.map`, js.map);
			console.error(`wrote ${path.relative(process.cwd(), `${output}.map`)}`); // eslint-disable-line no-console
		}
	} else {
		process.stdout.write(js.code);
	}
}

function getName(input) {
	return path.basename(input)
		.replace(path.extname(input), '')
		.replace(/[^a-zA-Z_$0-9]+/g, '_')
		.replace(/^_/, '')
		.replace(/_$/, '')
		.replace(/^(\d)/, '_$1');
}

exports.compile = compile;
