const fs = require('fs');
const path = require('path');
const { compile } = require('./compiler.js');

const extensions = ['.svelte', '.html'];
let compileOptions = {};

function capitalise(name) {
	return name[0].toUpperCase() + name.slice(1);
}

function register(options = {}) {
	if (options.extensions) {
		extensions.forEach(deregisterExtension);
		options.extensions.forEach(registerExtension);
	}

	compileOptions = Object.assign({}, options);
	delete compileOptions.extensions;
}

function deregisterExtension(extension) {
	delete require.extensions[extension];
}

function registerExtension(extension) {
	require.extensions[extension] = function(module, filename) {
		const name = path.parse(filename).name
			.replace(/^\d/, '_$&')
			.replace(/[^a-zA-Z0-9_$]/g, '');

		const options = Object.assign({}, compileOptions, {
			filename,
			name: capitalise(name),
			generate: 'ssr',
			format: 'cjs'
		});

		const { js, warnings } = compile(fs.readFileSync(filename, 'utf-8'), options);
		
		if (options.dev) {
			warnings.forEach(warning => {
				console.warn(`\nSvelte Warning in ${warning.filename}:`);
				console.warn(warning.message);
				console.warn(warning.frame);
			})
		}

		return module._compile(js.code, filename);
	};
}

registerExtension('.svelte');
registerExtension('.html');

module.exports = register;
