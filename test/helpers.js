import * as assert$1 from 'assert';
import * as jsdom from 'jsdom';
import glob from 'tiny-glob/sync';
import * as path from 'path';
import * as fs from 'fs';
import * as colors from 'kleur';

/**
 * @type {typeof assert$1 & { htmlEqual: (actual: string, expected: string, message?: string) => void, htmlEqualWithOptions: (actual: string, expected: string, options: { preserveComments?: boolean, withoutNormalizeHtml?: boolean }, message?: string) => void }}
 */
export const assert = /** @type {any} */ (assert$1);

// for coverage purposes, we need to test source files,
// but for sanity purposes, we need to test dist files
export function loadSvelte(test = false) {
	process.env.TEST = test ? 'true' : '';

	const resolved = require.resolve('../compiler.js');

	delete require.cache[resolved];
	return require(resolved);
}

export const svelte = loadSvelte();

export function exists(path) {
	try {
		fs.statSync(path);
		return true;
	} catch (err) {
		return false;
	}
}

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

export function cleanRequireCache() {
	Object.keys(require.cache)
		.filter((x) => x.endsWith('.svelte'))
		.forEach((file) => delete require.cache[file]);
}

const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.sendTo(console);

const window = new jsdom.JSDOM('<main></main>', { virtualConsole }).window;
global.document = window.document;
global.navigator = window.navigator;
global.getComputedStyle = window.getComputedStyle;
global.requestAnimationFrame = null; // placeholder, filled in using set_raf
global.window = window;

// add missing ecmascript globals to window
for (const key of Object.getOwnPropertyNames(global)) {
	if (!(key in window)) window[key] = global[key];
}

// implement mock scroll
window.scrollTo = function (pageXOffset, pageYOffset) {
	window.pageXOffset = pageXOffset;
	window.pageYOffset = pageYOffset;
};

export function env() {
	window.document.title = '';
	window.document.head.innerHTML = '';
	window.document.body.innerHTML = '<main></main>';

	return window;
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
	const window = env();

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

export function loadConfig(file) {
	try {
		const resolved = require.resolve(file);
		delete require.cache[resolved];

		const config = require(resolved);
		return config.default || config;
	} catch (err) {
		if (err.code === 'MODULE_NOT_FOUND') {
			return {};
		}

		throw err;
	}
}

export function addLineNumbers(code) {
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

export function showOutput(cwd, options = {}, compile = svelte.compile) {
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
				`\n>> ${colors.cyan().bold(file)}\n${addLineNumbers(js.code)}\n<< ${colors
					.cyan()
					.bold(file)}`
			);
		} catch (err) {
			console.log(`failed to generate output: ${err.message}`);
		}
	});
}

export function shouldUpdateExpected() {
	return process.argv.includes('--update');
}

export function spaces(i) {
	let result = '';
	while (i--) result += ' ';
	return result;
}

// fake timers
const original_set_timeout = global.setTimeout;

export function useFakeTimers() {
	const callbacks = [];

	// @ts-ignore
	global.setTimeout = function (fn) {
		callbacks.push(fn);
	};

	return {
		flush() {
			callbacks.forEach((fn) => fn());
			callbacks.splice(0, callbacks.length);
		},
		removeFakeTimers() {
			callbacks.splice(0, callbacks.length);
			global.setTimeout = original_set_timeout;
		}
	};
}

export function mkdirp(dir) {
	const parent = path.dirname(dir);
	if (parent === dir) return;

	mkdirp(parent);

	try {
		fs.mkdirSync(dir);
	} catch (err) {
		// do nothing
	}
}

export function prettyPrintBrowserAssertionError(message) {
	const match = /Error: Expected "(.+)" to equal "(.+)"/.exec(message);

	if (match) {
		assert.equal(match[1], match[2]);
	}
}
