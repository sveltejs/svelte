/** @import { CompileOptions } from '#compiler' */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { globSync } from 'tinyglobby';
import { VERSION, compile, compileModule, preprocess } from 'svelte/compiler';
import { vi } from 'vitest';

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

	/** @type {Promise<any>} */
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
 * @param {Partial<CompileOptions>} compileOptions
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

	for (let file of globSync('**', { cwd, onlyFiles: true })) {
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
					dev: opts.dev,
					experimental: opts.experimental
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
		} else if (
			file.endsWith('.svelte') &&
			// Make it possible to compile separate versions for client and server to simulate
			// cases where `{browser ? 'foo' : 'bar'}` is turning into `{'foo'}` on the server
			// and `{bar}` on the client, assuming we have sophisticated enough treeshaking
			// in the future to make this a thing.
			(!file.endsWith('.server.svelte') || generate === 'server') &&
			(!file.endsWith('.client.svelte') || generate === 'client')
		) {
			file = file.replace(/\.client\.svelte$/, '.svelte').replace(/\.server\.svelte$/, '.svelte');

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
				write(
					`${output_dir}/${file}.css.json`,
					JSON.stringify({ hasGlobal: compiled.css.hasGlobal })
				);
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

const svelte_dir = path.resolve(fileURLToPath(import.meta.url), '../..');

/** @type {number | undefined} */
let compiler_last_modified;

/**
 * Returns the most recent modification time of anything that can affect compiler output:
 * all files in `src/compiler`, all files outside of it that the compiler (transitively)
 * imports (`src/utils.js`, `src/constants.js` etc), the lockfile (for dependencies
 * like `esrap`) and this file (which contains `compile_directory`)
 */
function get_compiler_last_modified() {
	if (compiler_last_modified !== undefined) return compiler_last_modified;

	const files = globSync('**', {
		cwd: path.join(svelte_dir, 'src/compiler'),
		absolute: true,
		onlyFiles: true
	}).map((file) => path.resolve(file));

	const seen = new Set(files);

	// `files` grows as we go, so that we also follow imports of files outside `src/compiler`
	for (let i = 0; i < files.length; i += 1) {
		const file = files[i];
		if (!file.endsWith('.js')) continue;

		const code = fs.readFileSync(file, 'utf-8');

		for (const match of code.matchAll(/from\s*['"](\.\.?\/[^'"]+)['"]/g)) {
			const dependency = path.resolve(path.dirname(file), match[1]);
			if (seen.has(dependency)) continue;

			seen.add(dependency);
			if (fs.existsSync(dependency)) files.push(dependency);
		}
	}

	files.push(fileURLToPath(import.meta.url), path.resolve(svelte_dir, '../../pnpm-lock.yaml'));

	compiler_last_modified = Math.max(
		...files.filter((file) => fs.existsSync(file)).map((file) => fs.statSync(file).mtimeMs)
	);

	return compiler_last_modified;
}

/**
 * Like `compile_directory`, but skips compilation if `_output/{generate}` is still up to date.
 * That's the case if it was compiled with the same options and from the same set of files, and
 * neither the compiler (see `get_compiler_last_modified`) nor any of these files changed since.
 * The time of the last compilation is stored in `_output/{generate}/info.json`.
 *
 * Set `NO_COMPILE_CACHE=true` to always compile.
 *
 * @param {string} cwd
 * @param {'client' | 'server'} generate
 * @param {Partial<CompileOptions>} compileOptions
 */
export async function compile_directory_cached(cwd, generate, compileOptions = {}) {
	const info_file = `${cwd}/_output/${generate}/info.json`;

	// same files as `compile_directory` reads
	const files = globSync('**', { cwd, onlyFiles: true, ignore: ['_output/**'] })
		.filter((file) => !file.startsWith('_'))
		.sort();

	// functions such as `cssHash` would be dropped otherwise
	const options = JSON.stringify(compileOptions, (_, value) =>
		typeof value === 'function' ? value.toString() : value
	);

	if (process.env.NO_COMPILE_CACHE !== 'true') {
		/** @type {{ compiled_at: number; options: string; files: string[] } | null} */
		let info = null;

		try {
			info = JSON.parse(fs.readFileSync(info_file, 'utf-8'));
		} catch {
			// missing or corrupted (e.g. the process was killed while writing it)
		}

		if (
			typeof info?.compiled_at === 'number' &&
			info.options === options &&
			Array.isArray(info.files) &&
			info.files.join('\n') === files.join('\n')
		) {
			let last_modified = get_compiler_last_modified();

			for (const file of files) {
				last_modified = Math.max(last_modified, fs.statSync(`${cwd}/${file}`).mtimeMs);
			}

			if (last_modified < info.compiled_at) return;
		}
	}

	// take the timestamp before compiling, so that changes made while compiling are picked up next time
	const compiled_at = Date.now();

	// this removes `_output/{generate}` (including `info.json`) first, so if compilation fails we'll retry next time
	await compile_directory(cwd, generate, compileOptions);

	write(info_file, JSON.stringify({ compiled_at, options, files }, null, '\t'));
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

// Guard because not all test contexts load this with JSDOM
if (typeof window !== 'undefined') {
	// @ts-expect-error JS DOM doesn't support it
	Window.prototype.matchMedia = vi.fn((media) => {
		return {
			matches: false,
			media,
			addEventListener: () => {},
			removeEventListener: () => {}
		};
	});
}

export const fragments = /** @type {'html' | 'tree'} */ (process.env.FRAGMENTS) ?? 'html';

export const async_mode = process.env.SVELTE_NO_ASYNC !== 'true';

/**
 * @param {any[]} logs
 */
export function normalise_inspect_logs(logs) {
	/** @type {any[]} */
	const normalised = [];

	for (const log of logs) {
		if (log === 'stack trace') {
			// ignore `console.group('stack trace')` in default `$inspect(...)` output
			continue;
		}

		if (log instanceof Error) {
			const last_line = log.stack
				?.trim()
				.split('\n')
				.filter((line) => !line.includes('at Module.get_stack'))[1];

			const match = last_line && /(at .+) /.exec(last_line);

			if (match) normalised.push(match[1]);
		} else {
			normalised.push(log);
		}
	}

	return normalised;
}

/**
 * @param {any[]} logs
 */
export function normalise_trace_logs(logs) {
	let normalised = [];

	logs = logs.slice();

	while (logs.length > 0) {
		const log = logs.shift();

		if (log instanceof Error) {
			continue;
		}

		if (typeof log === 'string' && log.includes('%c')) {
			const split = log.split('%c');

			const first = /** @type {string} */ (split.shift()).trim();
			if (first) normalised.push({ log: first });

			while (split.length > 0) {
				const log = /** @type {string} */ (split.shift()).trim();
				const highlighted = logs.shift() === 'color: CornflowerBlue; font-weight: bold';

				// omit timings, as they will differ between runs
				if (/\(.+ms\)/.test(log)) continue;

				normalised.push({
					log,
					highlighted
				});
			}
		} else {
			normalised.push({ log });
		}
	}

	return normalised;
}
