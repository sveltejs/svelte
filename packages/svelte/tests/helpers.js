import * as fs from 'node:fs';
import * as path from 'node:path';
import glob from 'tiny-glob/sync.js';
import { compile, compileModule } from 'svelte/compiler';

/**
 * @param {string} file
 */
export function try_load_json(file) {
	try {
		return JSON.parse(fs.readFileSync(file, 'utf-8'));
	} catch (err) {
		if (/** @type {any} */ (err).code !== 'ENOENT') throw err;
		return null;
	}
}

/**
 * @param {string} file
 */
export function try_read_file(file) {
	try {
		return read_file(file);
	} catch (err) {
		if (/** @type {any} */ (err).code !== 'ENOENT') throw err;
		return null;
	}
}

/**
 * @param {string} file
 */
export function read_file(file) {
	return fs.readFileSync(file, 'utf-8').replace(/\r\n/g, '\n');
}

export function create_deferred() {
	/** @param {any} [value] */
	let resolve = (value) => {};

	/** @param {any} [reason] */
	let reject = (reason) => {};

	const promise = new Promise((f, r) => {
		resolve = f;
		reject = r;
	});

	return { promise, resolve, reject };
}

/**
 *
 * @param {string} cwd
 * @param {'client' | 'server'} generate
 * @param {Partial<import('#compiler').CompileOptions>} compileOptions
 */
export function compile_directory(cwd, generate, compileOptions = {}) {
	const output_dir = `${cwd}/_output/${generate}`;

	fs.rmSync(output_dir, { recursive: true, force: true });

	for (const file of glob('**', { cwd, filesOnly: true })) {
		if (file.startsWith('_')) continue;

		const text = fs.readFileSync(`${cwd}/${file}`, 'utf-8');
		const opts = { filename: path.join(cwd, file), ...compileOptions, generate };

		if (file.endsWith('.js')) {
			const out = `${output_dir}/${file}`;
			if (file.endsWith('.svelte.js')) {
				const compiled = compileModule(text, opts);
				write(out, compiled.js.code);
			} else {
				// for non-runes tests, just re-export from the original source file — this
				// allows the `_config.js` module to import shared state to use in tests
				const source = path
					.relative(path.dirname(out), path.resolve(cwd, file))
					.replace(/\\/g, '/');
				let result = `export * from '${source}';`;
				if (text.includes('export default')) {
					result += `\nexport { default } from '${source}';`;
				}

				write(out, result);
			}
		} else if (file.endsWith('.svelte')) {
			const compiled = compile(text, opts);

			write(`${output_dir}/${file}.js`, compiled.js.code);

			if (compiled.css) {
				write(`${output_dir}/${file}.css`, compiled.css.code);
			}
		}
	}
}

export function should_update_expected() {
	return process.env.SHOULD_UPDATE_EXPECTED === 'true';
}

/**
 * @param {string} file
 * @param {string} contents
 */
export function write(file, contents) {
	try {
		fs.mkdirSync(path.dirname(file), { recursive: true });
	} catch {}

	fs.writeFileSync(file, contents);
}
