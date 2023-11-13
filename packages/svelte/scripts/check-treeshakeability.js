import fs from 'node:fs';
import path from 'node:path';
import { rollup } from 'rollup';
import virtual from '@rollup/plugin-virtual';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

for (const key in pkg.exports) {
	for (const type of ['browser', 'default']) {
		if (!pkg.exports[key][type]) continue;

		const resolved = path.resolve(pkg.exports[key][type]);

		const bundle = await rollup({
			input: '__entry__',
			plugins: [
				virtual({
					__entry__: `import ${JSON.stringify(resolved)}`
				})
			],
			onwarn: (warning, handle) => {
				// if (warning.code !== 'EMPTY_BUNDLE') handle(warning);
			}
		});

		const { output } = await bundle.generate({});

		if (output.length > 1) {
			throw new Error('errr what');
		}

		const { code } = output[0];
		if (code.trim()) {
			console.error(code);
			throw new Error(`${path.join(pkg.name, key)} ${type} export is not tree-shakeable`);
		}
	}
}
