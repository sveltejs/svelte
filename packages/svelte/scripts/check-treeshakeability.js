import fs from 'node:fs';
import path from 'node:path';
import { rollup } from 'rollup';
import virtual from '@rollup/plugin-virtual';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

let failed = false;

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

		const code = output[0].code.replace(/import\s+([^'"]+from\s+)?(['"])[^'"]+\2\s*;?/, '');
		if (code.trim()) {
			console.error(code);
			console.error(`❌ ${subpackage} (${type})`);
			failed = true;
		} else {
			console.error(`✅ ${subpackage} (${type})`);
		}
	}
}

console.groupEnd();

if (failed) {
	process.exit(1);
}
