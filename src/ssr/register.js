import * as fs from 'fs';
import * as path from 'path';
import { compile } from '../index.ts';

let compileOptions = {
	extensions: ['.html']
};

function capitalise(name) {
	return name[0].toUpperCase() + name.slice(1);
}

export default function register(options) {
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
			generate: 'ssr'
		});

		const { js } = compile(fs.readFileSync(filename, 'utf-8'), options);

		return module._compile(js.code, filename);
	};
}

registerExtension('.html');