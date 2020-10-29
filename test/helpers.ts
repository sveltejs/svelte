import * as assert$1 from 'assert';
import * as jsdom from 'jsdom';
import glob from 'tiny-glob/sync';
import * as path from 'path';
import * as fs from 'fs';
import * as colors from 'kleur';
export const assert = (assert$1 as unknown) as typeof assert$1 & { htmlEqual: (actual, expected, message?) => void };

// for coverage purposes, we need to test source files,
// but for sanity purposes, we need to test dist files
export function loadSvelte(test) {
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
		.filter(x => x.endsWith('.svelte'))
		.forEach(file => delete require.cache[file]);
}

const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.sendTo(console);

const window = new jsdom.JSDOM('<main></main>', {virtualConsole}).window;
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
window.scrollTo = function(pageXOffset, pageYOffset) {
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

	attributes.forEach(attr => {
		node.removeAttribute(attr.name);
	});

	attributes.forEach(attr => {
		node.setAttribute(attr.name, attr.value);
	});

	// recurse
	[...node.childNodes].forEach(child => {
		if (child.nodeType === 3) {
			// text
			if (
				node.namespaceURI === 'http://www.w3.org/2000/svg' &&
				node.tagName !== 'text' &&
				node.tagName !== 'tspan'
			) {
				node.removeChild(child);
			}

			child.data = child.data.replace(/\s+/g, '\n');

			if (previous && previous.nodeType === 3) {
				previous.data += child.data;
				previous.data = previous.data.replace(/\s+/g, '\n');

				node.removeChild(child);
				child = previous;
			}
		} else {
			cleanChildren(child);
		}

		previous = child;
	});

	// collapse whitespace
	if (node.firstChild && node.firstChild.nodeType === 3) {
		node.firstChild.data = node.firstChild.data.replace(/^\s+/, '');
		if (!node.firstChild.data) node.removeChild(node.firstChild);
	}

	if (node.lastChild && node.lastChild.nodeType === 3) {
		node.lastChild.data = node.lastChild.data.replace(/\s+$/, '');
		if (!node.lastChild.data) node.removeChild(node.lastChild);
	}
}

export function normalizeHtml(window, html) {
	try {
		const node = window.document.createElement('div');
		node.innerHTML = html
			.replace(/<!--.*?-->/g, '')
			.replace(/>[\s\r\n]+</g, '><')
			.trim();
		cleanChildren(node);
		return node.innerHTML.replace(/<\/?noscript\/?>/g, '');
	} catch (err) {
		throw new Error(`Failed to normalize HTML:\n${html}`);
	}
}

export function setupHtmlEqual() {
	const window = env();

	// eslint-disable-next-line no-import-assign
	assert.htmlEqual = (actual, expected, message) => {
		assert.deepEqual(
			normalizeHtml(window, actual),
			normalizeHtml(window, expected),
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
				colors.gray(`  ${i}: `) +
				line.replace(/^\t+/, match => match.split('\t').join('    '))
			);
		})
		.join('\n');
}

export function showOutput(cwd, options = {}, compile = svelte.compile) {
	glob('**/*.svelte', { cwd }).forEach(file => {
		if (file[0] === '_') return;

		try {
			const { js } = compile(
				fs.readFileSync(`${cwd}/${file}`, 'utf-8'),
				Object.assign(options, {
					filename: file
				})
			);

			console.log( // eslint-disable-line no-console
				`\n>> ${colors.cyan().bold(file)}\n${addLineNumbers(js.code)}\n<< ${colors.cyan().bold(file)}`
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

	global.setTimeout = function(fn) {
		callbacks.push(fn);
	};

	return {
		flush() {
			callbacks.forEach(fn => fn());
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
