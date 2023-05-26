import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import glob from 'tiny-glob/sync.js';
import { compile } from '../src/compiler/index.js';

const cwd = path.resolve(process.argv[2]);

const options = [
	['normal', {}],
	['hydrate', { hydratable: true }],
	['ssr', { generate: 'ssr' }]
];
for (const file of glob('**/*.svelte', { cwd })) {
	const contents = readFileSync(`${cwd}/${file}`, 'utf-8').replace(/\r/g, '');

	for (const [name, opts] of options) {
		const dir = `${cwd}/_output/${name}`;

		const { js, css } = compile(contents, {
			...opts,
			filename: file
		});

		mkdirSync(dir, { recursive: true });
		js.code && writeFileSync(`${dir}/${file.replace(/\.svelte$/, '.js')}`, js.code);
		css.code && writeFileSync(`${dir}/${file.replace(/\.svelte$/, '.css')}`, css.code);
	}
}
