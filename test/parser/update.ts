import { readFileSync, writeFileSync } from 'fs';
import { glob } from '../tiny-glob';

// this file will replace all the expected.js files with their _actual
// equivalents. Only use it when you're sure that you haven't
// broken anything!
const svelte = (function loadSvelte(test) {
	process.env.TEST = test ? 'true' : '';
	const resolved = require.resolve('../../compiler.js');
	delete require.cache[resolved];
	return require(resolved);
})(false);

glob('samples/*/input.svelte', { cwd: __dirname })
	.forEach((file) => {
		try {
			writeFileSync(
				`${__dirname}/${file.replace('input.svelte', 'output.json')}`,
				JSON.stringify(
					svelte.compile(readFileSync(`${__dirname}/${file}`, 'utf-8').replace(/\s+$/, ''), { generate: false }).ast,
					null,
					'\t'
				)
			);
		} catch (e) {
			if (e.name !== 'ParseError') throw e;
			writeFileSync(
				`${__dirname}/${file.replace('input.svelte', 'error.json')}`,
				JSON.stringify({ ...e, message: e.message }, null, '\t')
			);
		}
	});
