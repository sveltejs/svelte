import * as fs from 'node:fs';
import * as path from 'node:path';
import glob from 'tiny-glob/sync';
import colors from 'kleur';
import { assert } from 'vitest';
import { compile } from '../compiler.js';
import { fileURLToPath } from 'node:url';

export function try_load_json(file) {
	try {
		return JSON.parse(fs.readFileSync(file, 'utf-8'));
	} catch (err) {
		if (err.code !== 'ENOENT') throw err;
		return null;
	}
}

export function try_read_file(file) {
	try {
		return fs.readFileSync(file, 'utf-8');
	} catch (err) {
		if (err.code !== 'ENOENT') throw err;
		return null;
	}
}

export async function try_load_config(path) {
	if (!fs.existsSync(path)) return {};
	// a whole

	// bunch

	// of lines

	// cause
	const result = await import(path);
	// source

	// maps

	// are

	// stupid

	return result.default;
}

export function should_update_expected() {
	return process.env.SHOULD_UPDATE_EXPECTED === 'true';
}

export function pretty_print_browser_assertion(message) {
	const match = /Error: Expected "(.+)" to equal "(.+)"/.exec(message);

	if (match) {
		assert.equal(match[1], match[2]);
	}
}

export function mkdirp(path) {
	if (!fs.existsSync(path)) {
		fs.mkdirSync(path, { recursive: true });
	}
}

export function add_line_numbers(code) {
	return code
		.split('\n')
		.map((line, i) => {
			i = String(i + 1);
			while (i.length < 3) i = ` ${i}`;

			return (
				colors.gray(`  ${i}: `) + line.replace(/^\t+/, (match) => match.split('\t').join('    '))
			);
		})
		.join('\n');
}

export function show_output(cwd, options = {}) {
	glob('**/*.svelte', { cwd }).forEach((file) => {
		if (file[0] === '_') return;

		try {
			const { js } = compile(
				fs.readFileSync(`${cwd}/${file}`, 'utf-8'),
				Object.assign({}, options, {
					filename: file
				})
			);

			console.log(
				// eslint-disable-line no-console
				`\n>> ${colors.cyan().bold(file)}\n${add_line_numbers(js.code)}\n<< ${colors
					.cyan()
					.bold(file)}`
			);
		} catch (err) {
			console.log(`failed to generate output: ${err.message}`);
		}
	});
}

const svelte_path = fileURLToPath(new URL('..', import.meta.url)).replace(/\\/g, '/');

export function create_loader(compileOptions, cwd) {
	const cache = new Map();

	async function load(file) {
		if (cache.has(file)) return cache.get(file);

		if (file.endsWith('.svelte')) {
			const compiled = compile(
				// Windows/Linux newline conversion
				fs.readFileSync(file, 'utf-8').replace(/\r\n/g, '\n'),
				{
					...compileOptions,
					filename: file
				}
			);

			const imports = new Map();

			for (const match of compiled.js.code.matchAll(/require\("(.+?)"\)/g)) {
				const source = match[1];
				let resolved = source;

				if (source.startsWith('.')) {
					resolved = path.resolve(path.dirname(file), source);
				}

				if (source === 'svelte') {
					resolved = `${svelte_path}src/runtime/index.js`;
				}

				if (source.startsWith('svelte/')) {
					resolved = `${svelte_path}src/runtime/${source.slice(7)}/index.js`;
				}

				imports.set(source, await load(resolved));
			}

			function require(id) {
				return imports.get(id);
			}

			const fn = new Function('require', 'exports', 'module', compiled.js.code);
			const module = { exports: {} };
			fn(require, module.exports, module);

			cache.set(file, module.exports);
			return module.exports;
		} else {
			return import(file);
		}
	}

	return (file) => load(path.resolve(cwd, file));
}

export function create_deferred() {
	/** @type {(value: any) => void} */
	let resolve;
	/** @type {(reason: any) => void} */
	let reject;

	const promise = new Promise((f, r) => {
		resolve = f;
		reject = r;
	});

	return { promise, resolve, reject };
}
