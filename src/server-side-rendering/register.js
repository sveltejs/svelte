import * as fs from 'fs';
import * as path from 'path';
import { compile } from '../index.ts';

const compileOptions = {};

function capitalise(name) {
	return name[0].toUpperCase() + name.slice(1);
}

export default function register(options) {
	const { extensions } = options;

	if (extensions) {
		_deregister('.html');
		extensions.forEach(_register);
	}

	// TODO make this the default and remove in v2
	if ('store' in options) compileOptions.store = options.store;
}

function _deregister(extension) {
	delete require.extensions[extension];
}

function _register(extension) {
	require.extensions[extension] = function(module, filename) {
		const options = Object.assign({}, compileOptions, {
			filename,
			name: capitalise(path.basename(filename)
				.replace(new RegExp(`${extension.replace('.', '\\.')}$`), '')),
			generate: 'ssr'
		});

		const {code} = compile(fs.readFileSync(filename, 'utf-8'), options);

		return module._compile(code, filename);
	};
}

_register('.html');
