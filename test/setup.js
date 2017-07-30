const fs = require('fs');
const path = require('path');

require('console-group').install();
require('source-map-support').install();

require.extensions['.js'] = function(module, filename) {
	const exports = [];

	var code = fs.readFileSync(filename, 'utf-8')
		.replace(/^import (?:\* as )?(\w+) from ['"]([^'"]+)['"];?/gm, 'var $1 = require("$2");')
		.replace(/^import {([^}]+)} from ['"](.+)['"];?/gm, 'var {$1} = require("$2");')
		.replace(/^export default /gm, 'module.exports = ')
		.replace(/^export (const|let|var|class|function) (\w+)/gm, (match, type, name) => {
			exports.push(name);
			return `${type} ${name}`;
		})
		.replace(/^export \{([^}]+)\}/gm, (match, names) => {
			names.split(',').filter(Boolean).forEach(name => {
				exports.push(name);
			});

			return '';
		})
		.replace(/^export function (\w+)/gm, 'exports.$1 = function $1');

	exports.forEach(name => {
		code += `\nexports.${name} = ${name};`;
	});

	try {
		return module._compile(code, filename);
	} catch (err) {
		console.log(code); // eslint-disable-line no-console
		throw err;
	}
};