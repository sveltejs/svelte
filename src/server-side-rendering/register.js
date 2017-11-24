import * as fs from 'fs';
import * as path from 'path';
import { compile } from '../index.ts';

function capitalise(name) {
	return name[0].toUpperCase() + name.slice(1);
}

export default function register(options) {
	const { extensions } = options;
	if (extensions) {
		_deregister('.html');
		extensions.forEach(_register);
	}
}

function _deregister(extension) {
	delete require.extensions[extension];
}

function _register(extension) {
	require.extensions[extension] = function(module, filename) {
		const {code} = compile(fs.readFileSync(filename, 'utf-8'), {
			filename,
			name: capitalise(path.basename(filename)
				.replace(new RegExp(`${extension.replace('.', '\\.')}$`), '')),
			generate: 'ssr',
		});

		return module._compile(code, filename);
	};
}

_register('.html');
