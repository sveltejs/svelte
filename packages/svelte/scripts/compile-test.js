// Compile all Svelte files in a directory to JS and CSS files
// Usage: node scripts/compile-test.js <directory>

import {
	mkdirSync as mkdir_sync,
	readFileSync as read_file_sync,
	writeFileSync as write_file_sync
} from 'fs';

import { compile } from '../src/compiler/index.js';
import glob from 'tiny-glob/sync.js';
import path from 'path';

const cwd = path.resolve(process.argv[2]);

const options = [
	['normal', {}],
	['hydrate', { hydratable: true }],
	['ssr', { generate: 'ssr' }]
];
for (const file of glob('**/*.svelte', { cwd })) {
	const contents = read_file_sync(`${cwd}/${file}`, 'utf-8').replace(/\r/g, '');
	let w;
	for (const [name, opts] of options) {
		const dir = `${cwd}/_output/${name}`;

		const { js, css, warnings } = compile(contents, {
			...opts,
			filename: file
		});

		if (warnings.length) {
			w = warnings;
		}

		mkdir_sync(dir, { recursive: true });
		js.code && write_file_sync(`${dir}/${file.replace(/\.svelte$/, '.js')}`, js.code);
		css.code && write_file_sync(`${dir}/${file.replace(/\.svelte$/, '.css')}`, css.code);
	}

	if (w) {
		console.log(`Warnings for ${file}:`);
		console.log(w);
	}
}
