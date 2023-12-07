import fs from 'node:fs';
import path from 'node:path';
import { rollup } from 'rollup';
import virtual from '@rollup/plugin-virtual';
import { nodeResolve } from '@rollup/plugin-node-resolve';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

let failed = false;

// eslint-disable-next-line no-console
console.group('checking treeshakeability');

for (const key in pkg.exports) {
	// special cases
	if (key === './compiler') continue;
	if (key === './internal/disclose-version') continue;

	for (const type of ['browser', 'default']) {
		if (!pkg.exports[key][type]) continue;

		const subpackage = path.join(pkg.name, key);

		const resolved = path.resolve(pkg.exports[key][type]);

		const bundle = await rollup({
			input: '__entry__',
			plugins: [
				virtual({
					__entry__: `import ${JSON.stringify(resolved)}`
				}),
				nodeResolve({
					exportConditions: ['production', 'import', 'browser', 'default']
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

		const code = output[0].code.trim();

		if (code === '') {
			// eslint-disable-next-line no-console
			console.error(`✅ ${subpackage} (${type})`);
		} else {
			// eslint-disable-next-line no-console
			console.error(code);
			// eslint-disable-next-line no-console
			console.error(`❌ ${subpackage} (${type})`);
			failed = true;
		}
	}
}

// eslint-disable-next-line no-console
console.groupEnd();

if (failed) {
	process.exit(1);
}
