import * as fs from 'node:fs';
import * as path from 'node:path';
import glob from 'tiny-glob/sync';
import colors from 'kleur';
import { assert } from 'vitest';
import { compile } from 'svelte/compiler';
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
				`\n>> ${colors.cyan().bold(file)}\n${add_line_numbers(js.code)}\n<< ${colors
					.cyan()
					.bold(file)}`
			);
		} catch (err) {
			console.log(`failed to generate output: ${err.message}`);
		}
	});
}

const svelte_path = fileURLToPath(new URL('..', import.meta.url).href).replace(/\\/g, '/');

const AsyncFunction = /** @type {typeof Function} */ (async function () {}.constructor);

export function create_loader(compileOptions, cwd) {
	const cache = new Map();

	async function load(file) {
		if (cache.has(file)) return cache.get(file);

		if (file.endsWith('.svelte')) {
			const options = {
				...compileOptions,
				filename: file
			};

			const compiled = compile(
				// Windows/Linux newline conversion
				fs.readFileSync(file, 'utf-8').replace(/\r\n/g, '\n'),
				options
			);

			const __import = (id) => {
				let resolved = id;

				if (id.startsWith('.')) {
					resolved = path.resolve(path.dirname(file), id);
				}

				if (id === 'svelte') {
					resolved = `${svelte_path}src/runtime/index.js`;
				}

				if (id.startsWith('svelte/')) {
					resolved = `${svelte_path}src/runtime/${id.slice(7)}/index.js`;
				}

				return load(resolved);
			};

			const exports = [];

			// We can't use Node's or Vitest's loaders cause we compile with different options.
			// We need to rewrite the imports into function calls that we can intercept to transform
			// any imported Svelte components as well. A few edge cases aren't handled but also
			// currently unused in the tests, for example `export * from`and live bindings.
			let transformed = compiled.js.code
				.replace(/^import ['"]([^'"]+)['"]/gm, 'await __import("$1")')
				.replace(
					/^import \* as (\w+) from ['"]([^'"]+)['"];?/gm,
					'const $1 = await __import("$2");'
				)
				.replace(
					/^import (\w+) from ['"]([^'"]+)['"];?/gm,
					'const {default: $1} = await __import("$2");'
				)
				.replace(
					/^import (\w+, )?{([^}]+)} from ['"](.+)['"];?/gm,
					(_, default_, names, source) => {
						const d = default_ ? `default: ${default_}` : '';
						return `const { ${d} ${names.replaceAll(
							' as ',
							': '
						)} } = await __import("${source}");`;
					}
				)
				.replace(/^export default /gm, '__exports.default = ')
				.replace(
					/^export (const|let|var|class|function|async\s+function) (\w+)/gm,
					(_, type, name) => {
						exports.push(name);
						return `${type} ${name}`;
					}
				)
				.replace(/^export \{([^}]+)\}(?: from ['"]([^'"]+)['"];?)?/gm, (_, names, source) => {
					const entries = names.split(',').map((name) => {
						const match = name.trim().match(/^(\w+)( as (\w+))?$/);
						const i = match[1];
						const o = match[3] || i;

						return [o, i];
					});
					return source
						? `{ const __mod = await __import("${source}"); ${entries
								.map(([o, i]) => `__exports.${o} = __mod.${i};`)
								.join('\n')}}`
						: `{ ${entries.map(([o, i]) => `__exports.${o} = ${i};`).join('\n')} }`;
				});

			exports.forEach((name) => {
				transformed += `\n__exports.${name} = ${name};`;
			});

			const __exports = {
				[Symbol.toStringTag]: 'Module'
			};
			try {
				const fn = new AsyncFunction('__import', '__exports', transformed);
				await fn(__import, __exports);
			} catch (err) {
				console.error(compileOptions, transformed);
				throw err;
			}

			cache.set(file, __exports);
			return __exports;
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
