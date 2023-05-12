import * as fs from 'fs';
import { createRequire } from 'module';

export function tryToLoadJson(file) {
	try {
		return JSON.parse(fs.readFileSync(file, 'utf-8'));
	} catch (err) {
		if (err.code !== 'ENOENT') throw err;
		return null;
	}
}

export function tryToReadFile(file) {
	try {
		return fs.readFileSync(file, 'utf-8');
	} catch (err) {
		if (err.code !== 'ENOENT') throw err;
		return null;
	}
}

export function try_load_config(path,) {
	return import(path).then(
		(mod) => mod.default,
		() => ({})
	);
}
