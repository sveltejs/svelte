import { JSDOM } from 'jsdom';
import assert from 'assert';
import glob from 'glob';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

// for coverage purposes, we need to test source files,
// but for sanity purposes, we need to test dist files
export function loadSvelte(test) {
	if (test) global.__svelte_test = true;

	const resolved = process.env.COVERAGE
		? require.resolve('../src/index.js')
		: require.resolve('../compiler/svelte.js');

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
		return JSON.parse(fs.readFileSync(file));
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

const { window } = new JSDOM('<main></main>');
global.document = window.document;

export function env() {
	window._svelteTransitionManager = null;
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
		if (child.nodeType === 8) {
			// comment
			node.removeChild(child);
			return;
		}

		if (child.nodeType === 3) {
			// text
			if (
				node.namespaceURI === 'http://www.w3.org/2000/svg' &&
				node.tagName !== 'text' &&
				node.tagName !== 'tspan'
			) {
				node.removeChild(child);
			}

			child.data = child.data.replace(/\s{2,}/g, '\n');

			if (previous && previous.nodeType === 3) {
				previous.data += child.data;
				previous.data = previous.data.replace(/\s{2,}/g, '\n');

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
			.replace(/>[\s\r\n]+</g, '><')
			.trim();
		cleanChildren(node, '');
		return node.innerHTML.replace(/<\/?noscript\/?>/g, '');
	} catch (err) {
		throw new Error(`Failed to normalize HTML:\n${html}`);
	}
}

export function setupHtmlEqual() {
	const window = env();

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
				chalk.grey(`  ${i}: `) +
				line.replace(/^\t+/, match => match.split('\t').join('    '))
			);
		})
		.join('\n');
}

function capitalise(str) {
	return str[0].toUpperCase() + str.slice(1);
}

export function showOutput(cwd, options = {}) {
	glob.sync('**/*.html', { cwd }).forEach(file => {
		if (file[0] === '_') return;
		const { code } = svelte.compile(
			fs.readFileSync(`${cwd}/${file}`, 'utf-8'),
			Object.assign(options, {
				filename: file,
				name: capitalise(path.basename(file).replace(/\.html$/, ''))
			})
		);

		console.log( // eslint-disable-line no-console
			`\n>> ${chalk.cyan.bold(file)}\n${addLineNumbers(code)}\n<< ${chalk.cyan.bold(file)}`
		);
	});
}

const start = /\n(\t+)/;
export function deindent(strings, ...values) {
	const indentation = start.exec(strings[0])[1];
	const pattern = new RegExp(`^${indentation}`, 'gm');

	let result = strings[0].replace(start, '').replace(pattern, '');

	let trailingIndentation = getTrailingIndentation(result);

	for (let i = 1; i < strings.length; i += 1) {
		let expression = values[i - 1];
		const string = strings[i].replace(pattern, '');

		if (Array.isArray(expression)) {
			expression = expression.length ? expression.join('\n') : null;
		}

		if (expression || expression === '') {
			const value = String(expression).replace(
				/\n/g,
				`\n${trailingIndentation}`
			);
			result += value + string;
		} else {
			let c = result.length;
			while (/\s/.test(result[c - 1])) c -= 1;
			result = result.slice(0, c) + string;
		}

		trailingIndentation = getTrailingIndentation(result);
	}

	return result.trim().replace(/\t+$/gm, '');
}

function getTrailingIndentation(str) {
	let i = str.length;
	while (str[i - 1] === ' ' || str[i - 1] === '\t') i -= 1;
	return str.slice(i, str.length);
}

export function spaces(i) {
	let result = '';
	while (i--) result += ' ';
	return result;
}
