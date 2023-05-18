import * as fs from 'fs';
import * as path from 'path';
import glob from 'tiny-glob/sync';
import colors from 'kleur';
import { assert } from 'vitest';
import { compile } from '../compiler.js';
import { fileURLToPath } from 'url';

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
				Object.assign(options, {
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

const svelte_path = fileURLToPath(new URL('..', import.meta.url));

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
					resolved = `${svelte_path}/index.mjs`;
				}

				if (source.startsWith('svelte/')) {
					resolved = `${svelte_path}/${source.slice(7)}/index.mjs`;
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

function cleanChildren(node) {
	let previous = null;

	// sort attributes
	const attributes = Array.from(node.attributes).sort((a, b) => {
		return a.name < b.name ? -1 : 1;
	});

	attributes.forEach((attr) => {
		node.removeAttribute(attr.name);
	});

	attributes.forEach((attr) => {
		node.setAttribute(attr.name, attr.value);
	});

	for (let child of [...node.childNodes]) {
		if (child.nodeType === 3) {
			// text
			if (
				node.namespaceURI === 'http://www.w3.org/2000/svg' &&
				node.tagName !== 'text' &&
				node.tagName !== 'tspan'
			) {
				node.removeChild(child);
			}

			child.data = child.data.replace(/[ \t\n\r\f]+/g, '\n');

			if (previous && previous.nodeType === 3) {
				previous.data += child.data;
				previous.data = previous.data.replace(/[ \t\n\r\f]+/g, '\n');

				node.removeChild(child);
				child = previous;
			}
		} else if (child.nodeType === 8) {
			// comment
			// do nothing
		} else {
			cleanChildren(child);
		}

		previous = child;
	}

	// collapse whitespace
	if (node.firstChild && node.firstChild.nodeType === 3) {
		node.firstChild.data = node.firstChild.data.replace(/^[ \t\n\r\f]+/, '');
		if (!node.firstChild.data.length) node.removeChild(node.firstChild);
	}

	if (node.lastChild && node.lastChild.nodeType === 3) {
		node.lastChild.data = node.lastChild.data.replace(/[ \t\n\r\f]+$/, '');
		if (!node.lastChild.data.length) node.removeChild(node.lastChild);
	}
}

/**
 *
 * @param {Window} window
 * @param {string} html
 * @param {{ removeDataSvelte?: boolean, preserveComments?: boolean }} param2
 * @returns
 */
export function normalizeHtml(
	window,
	html,
	{ removeDataSvelte = false, preserveComments = false }
) {
	try {
		const node = window.document.createElement('div');
		node.innerHTML = html
			.replace(/(<!--.*?-->)/g, preserveComments ? '$1' : '')
			.replace(/(data-svelte-h="[^"]+")/g, removeDataSvelte ? '' : '$1')
			.replace(/>[ \t\n\r\f]+</g, '><')
			.trim();
		cleanChildren(node);
		return node.innerHTML.replace(/<\/?noscript\/?>/g, '');
	} catch (err) {
		throw new Error(`Failed to normalize HTML:\n${html}`);
	}
}

/**
 * @param {string} html
 * @returns {string}
 */
export function normalizeNewline(html) {
	return html.replace(/\r\n/g, '\n');
}

/**
 * @param {{ removeDataSvelte?: boolean }} options
 */
export function setupHtmlEqual(options = {}) {
	// eslint-disable-next-line no-import-assign
	assert.htmlEqual = (actual, expected, message) => {
		assert.deepEqual(
			normalizeHtml(window, actual, options),
			normalizeHtml(window, expected, options),
			message
		);
	};

	/**
	 *
	 * @param {string} actual
	 * @param {string} expected
	 * @param {{ preserveComments?: boolean, withoutNormalizeHtml?: boolean }} param2
	 * @param {string?} message
	 */
	assert.htmlEqualWithOptions = (
		actual,
		expected,
		{ preserveComments, withoutNormalizeHtml },
		message
	) => {
		assert.deepEqual(
			withoutNormalizeHtml
				? normalizeNewline(actual).replace(
						/(\sdata-svelte-h="[^"]+")/g,
						options.removeDataSvelte ? '' : '$1'
				  )
				: normalizeHtml(window, actual, { ...options, preserveComments }),
			withoutNormalizeHtml
				? normalizeNewline(expected).replace(
						/(\sdata-svelte-h="[^"]+")/g,
						options.removeDataSvelte ? '' : '$1'
				  )
				: normalizeHtml(window, expected, { ...options, preserveComments }),
			message
		);
	};
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
