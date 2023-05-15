import * as fs from 'fs';
import * as path from 'path';
import { assert } from 'vitest';
import { compile } from '../compiler.js';

export function try_load_json(file) {
	try {
		return JSON.parse(fs.readFileSync(file, 'utf-8'));
	} catch (err) {
		if (err.code !== 'ENOENT') throw err;
		return null;
	}
}

export function try_load_module(promise) {
	return promise.then(
		(m) => m.default,
		() => ({})
	);
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
	const _ = 1;
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

export function create_loader(compileOptions, cwd) {
	const cache = new Map();

	async function load(file) {
		if (cache.has(file)) return cache.get(file);

		if (file.endsWith('.svelte')) {
			const compiled = compile(fs.readFileSync(file, 'utf-8'), {
				...compileOptions,
				filename: file
			});

			const imports = new Map();

			for (const match of compiled.js.code.matchAll(/require\("(.+?)"\)/g)) {
				const source = match[1];

				const resolved = source.startsWith('.') ? path.resolve(path.dirname(file), source) : source;
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
