import * as fs from 'node:fs';
import * as path from 'node:path';
import glob from 'tiny-glob/sync.js';
import { VERSION, compile, compileModule, preprocess } from 'svelte/compiler';

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
 * @param {boolean} [output_map]
 * @param {any} [preprocessor]
 */
export async function compile_directory(
	cwd,
	generate,
	compileOptions = {},
	output_map = false,
	preprocessor
) {
	const output_dir = `${cwd}/_output/${generate}`;

	fs.rmSync(output_dir, { recursive: true, force: true });

	for (const file of glob('**', { cwd, filesOnly: true })) {
		if (file.startsWith('_')) continue;

		let text = fs.readFileSync(`${cwd}/${file}`, 'utf-8').replace(/\r\n/g, '\n');
		let opts = {
			filename: path.join(cwd, file),
			...compileOptions,
			generate
		};

		if (file.endsWith('.js')) {
			const out = `${output_dir}/${file}`;
			if (file.endsWith('.svelte.js')) {
				const compiled = compileModule(text, {
					filename: opts.filename,
					generate: opts.generate,
					dev: opts.dev
				});
				write(out, compiled.js.code.replace(`v${VERSION}`, 'VERSION'));
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
			if (preprocessor?.preprocess) {
				const preprocessed = await preprocess(
					text,
					preprocessor.preprocess,
					preprocessor.options || {
						filename: opts.filename
					}
				);
				text = preprocessed.code;
				opts = { ...opts, sourcemap: preprocessed.map };
				write(`${output_dir}/${file.slice(0, -7)}.preprocessed.svelte`, text);
				if (output_map) {
					write(
						`${output_dir}/${file.slice(0, -7)}.preprocessed.svelte.map`,
						JSON.stringify(preprocessed.map, null, '\t')
					);
				}
			}

			const compiled = compile(text, {
				outputFilename: `${output_dir}/${file}${file.endsWith('.js') ? '' : '.js'}`,
				cssOutputFilename: `${output_dir}/${file}.css`,
				...opts
			});
			compiled.js.code = compiled.js.code.replace(`v${VERSION}`, 'VERSION');

			write(`${output_dir}/${file}.js`, compiled.js.code);
			if (output_map) {
				write(`${output_dir}/${file}.js.map`, JSON.stringify(compiled.js.map, null, '\t'));
			}

			if (compiled.css) {
				write(`${output_dir}/${file}.css`, compiled.css.code);
				if (output_map) {
					write(`${output_dir}/${file}.css.map`, JSON.stringify(compiled.css.map, null, '\t'));
				}
			}

			if (compiled.warnings.length > 0) {
				write(`${output_dir}/${file}.warnings.json`, JSON.stringify(compiled.warnings, null, '\t'));
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
