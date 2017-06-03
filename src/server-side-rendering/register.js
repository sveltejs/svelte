import * as fs from 'fs';
import * as path from 'path';
import { compile } from '../index.ts';

function capitalise(name) {
	return name[0].toUpperCase() + name.slice(1);
}

require.extensions['.html'] = function(module, filename) {
	const { code } = compile(fs.readFileSync(filename, 'utf-8'), {
		filename,
		name: capitalise(path.basename(filename).replace(/\.html$/, '')),
		generate: 'ssr'
	});

	return module._compile(code, filename);
};
