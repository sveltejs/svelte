import './ambient';
import * as assert$1 from 'assert';
export const assert = (assert$1 as unknown) as typeof assert$1 & { htmlEqual: (actual, expected, message?) => void };
import { glob } from './tiny-glob';

require('source-map-support').install();

process.env.TEST = true;

import { readFileSync } from 'fs';
require.extensions['.js'] = function (module, filename) {
	const exports = [];

	let code = readFileSync(filename, 'utf-8')
		.replace(/^import \* as (\w+) from ['"]([^'"]+)['"];?/gm, 'var $1 = require("$2");')
		.replace(/^import (\w+) from ['"]([^'"]+)['"];?/gm, 'var {default: $1} = require("$2");')
		.replace(/^import {([^}]+)} from ['"](.+)['"];?/gm, 'var {$1} = require("$2");')
		.replace(/^export default /gm, 'exports.default = ')
		.replace(/^export (const|let|var|class|function) (\w+)/gm, (_match, type, name) => {
			exports.push(name);
			return `${type} ${name}`;
		})
		.replace(/^export \{([^}]+)\}(?: from ['"]([^'"]+)['"];?)?/gm, (_match, names, source) => {
			names
				.split(',')
				.filter(Boolean)
				.forEach((name) => {
					exports.push(name);
				});

			return source ? `const { ${names} } = require("${source}");` : '';
		})
		.replace(/^export function (\w+)/gm, 'exports.$1 = function $1');

	exports.forEach((name) => {
		code += `\nexports.${name} = ${name};`;
	});

	try {
		return module._compile(code, filename);
	} catch (err) {
		console.log(code);
		throw err;
	}
};
import './helpers';
import '../internal';
console.clear();

const test_folders = glob('*/index.ts', { cwd: 'test' });
const solo_folders = test_folders.filter((folder) => /\.solo/.test(folder));

if (solo_folders.length) {
	if (process.env.CI) {
		throw new Error('Forgot to remove `.solo` from test');
	}
	solo_folders.forEach((name) => require('./' + name));
} else {
	test_folders.forEach((name) => require('./' + name));
}
