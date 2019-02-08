const fs = require('fs');
const path = require('path');
const { compile } = require('./compiler.js');

let compileOptions = {
	extensions: ['.svelte', '.html']
};

function capitalise(name) {
	return name[0].toUpperCase() + name.slice(1);
}

function register(options) {
	if (options.extensions) {
		compileOptions.extensions.forEach(deregisterExtension);
		options.extensions.forEach(registerExtension);
	}

	compileOptions = options;
}

function deregisterExtension(extension) {
	delete require.extensions[extension];
}

function registerExtension(extension) {
	require.extensions[extension] = function(module, filename) {
		const name = path.basename(filename)
			.slice(0, -path.extname(filename).length)
			.replace(/^\d/, '_$&')
			.replace(/[^a-zA-Z0-9_$]/g, '');

		const options = Object.assign({}, compileOptions, {
			filename,
			name: capitalise(name),
			generate: 'ssr',
			format: 'cjs'
		});

		const { js } = compile(fs.readFileSync(filename, 'utf-8'), options);

		return module._compile(js.code, filename);
	};
}

registerExtension('.svelte');
registerExtension('.html');

module.exports = register;