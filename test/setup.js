const nodeVersionMatch = /^v(\d)/.exec(process.version);
const legacy = +nodeVersionMatch[1] < 6;
const babelrc = require("../package.json").babel;
const fs = require('fs');

if (legacy) {
	require("babel-register")(babelrc);
} else {
	require.extensions['.js'] = function(module, filename) {
		const exports = [];

		let code = fs.readFileSync(filename, 'utf-8')
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
}
