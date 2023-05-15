import * as fs from 'fs';
import { assert } from 'vitest';

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

export function try_load_config(path) {
	return import(path).then(
		(mod) => mod.default,
		() => ({})
	);
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
