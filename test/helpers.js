import jsdom from 'jsdom';
import assert from 'assert';
import glob from 'glob';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

import * as consoleGroup from 'console-group';
consoleGroup.install();

import * as sourceMapSupport from 'source-map-support';
sourceMapSupport.install();

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

export function env() {
	return new Promise((fulfil, reject) => {
		jsdom.env('<main></main>', (err, window) => {
			if (err) {
				reject(err);
			} else {
				global.document = window.document;
				fulfil(window);
			}
		});
	});
}

function cleanChildren(node) {
	let previous = null;

	[...node.childNodes].forEach(child => {
		if (child.nodeType === 8) {
			// comment
			node.removeChild(child);
			return;
		}

		if (child.nodeType === 3) {
			if (
				node.namespaceURI === 'http://www.w3.org/2000/svg' &&
				node.tagName !== 'text' &&
				node.tagName !== 'tspan'
			) {
				node.removeChild(child);
			}

			child.data = child.data.replace(/\s{2,}/, '\n');

			// text
			if (previous && previous.nodeType === 3) {
				previous.data += child.data;
				previous.data = previous.data.replace(/\s{2,}/, '\n');

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

export function setupHtmlEqual() {
	return env().then(window => {
		assert.htmlEqual = (actual, expected, message) => {
			window.document.body.innerHTML = actual
				.replace(/>[\s\r\n]+</g, '><')
				.trim();
			cleanChildren(window.document.body, '');
			actual = window.document.body.innerHTML;

			window.document.body.innerHTML = expected
				.replace(/>[\s\r\n]+</g, '><')
				.trim();
			cleanChildren(window.document.body, '');
			expected = window.document.body.innerHTML;

			assert.deepEqual(actual, expected, message);
		};
	});
}

export function loadConfig(file) {
	try {
		const resolved = require.resolve(file);
		delete require.cache[resolved];
		return require(resolved).default;
	} catch (err) {
		if (err.code === 'E_NOT_FOUND') {
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

function capitalize(str) {
	return str[0].toUpperCase() + str.slice(1);
}

export function showOutput(cwd, options) {
	glob.sync('**/*.html', { cwd }).forEach(file => {
		const { code } = svelte.compile(
			fs.readFileSync(`${cwd}/${file}`, 'utf-8'),
			Object.assign(options, {
				name: capitalize(file.slice(0, -path.extname(file).length))
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
