import * as path from 'path';
import * as fs from 'fs';
import * as svelte from 'svelte';
import error from './error.js';

function mkdirp(dir) {
	const parent = path.dirname(dir);
	if (dir === parent) return;

	mkdirp(parent);
	if (!fs.existsSync(dir)) fs.mkdirSync(dir);
}

export function compile(input, opts) {
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
		store: opts.store,
		shared: opts.shared
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
	return path
		.basename(input)
		.replace(path.extname(input), '')
		.replace(/[^a-zA-Z_$0-9]+/g, '_')
		.replace(/^_/, '')
		.replace(/_$/, '')
		.replace(/^(\d)/, '_$1');
}
