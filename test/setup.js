const fs = require('fs');

require('source-map-support').install();

process.env.TEST = true;

require.extensions['.js'] = function(module, filename) {
	const exports = [];

	let code = fs.readFileSync(filename, 'utf-8')
		.replace(/^import\s+\*\s+as\s+(\w+)\s+from\s+(['"])(.+?)\2;?/gm, 'var $1 = require($2$3$2);')
		.replace(/^import\s+(\w+)\s+from\s+(['"])(.+?)\2;?/gm, 'var {default: $1} = require($2$3$2);')
		.replace(/^import\s+(?:(\w+)\s*,\s*)?{([^}]+)}(?:\s*,\s*(\w+))?\s+from\s+(['"])(.+?)\4;?/gm,
			(match, default_name_1, names, default_name_2, quote, source) => {
			names = names.replace(/\s+as\s+/g, ': ');
			let default_name = default_name_1 || default_name_2;
			default_name = default_name ? `default: ${default_name}, ` : '';
			return `var {${default_name}${names}} = require(${quote}${source}${quote});`;
		})
		.replace(/^export\s+default\s+/gm, 'exports.default = ')
		.replace(/^export\s+(const|let|var|class|function)\s+(\w+)/gm, (match, type, name) => {
			exports.push(name);
			return `${type} ${name}`;
		})
		.replace(/^export\s+\{([^}]+)\}(?:\s+from\s+(['"])(.+?)\2;?)?/gm, (match, names, quote, source) => {
			names.split(',').filter(Boolean).forEach(name => {
				exports.push(name);
			});

			return source ? `const { ${names} } = require(${quote}${source}${quote});` : '';
		})
		.replace(/^export\s+function\s+(\w+)/gm, 'exports.$1 = function $1');

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
