import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assert, it } from 'vitest';
import { parse } from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const samples_dir = path.join(__dirname, 'samples');

for (const sample of fs.readdirSync(samples_dir)) {
	const cwd = path.join(samples_dir, sample);

	if (!fs.statSync(cwd).isDirectory()) continue;

	if (fs.existsSync(path.join(cwd, 'error.json'))) {
		// Error test
		it(sample, () => {
			const input = fs.readFileSync(path.join(cwd, 'input.css'), 'utf-8');
			const expected = JSON.parse(fs.readFileSync(path.join(cwd, 'error.json'), 'utf-8'));

			try {
				parse(input);
				assert.fail('Expected an error');
			} catch (e: any) {
				assert.equal(e.code, expected.code);
				if (expected.message) {
					assert.include(e.message, expected.message);
				}
			}
		});
	} else {
		// Parse test
		it(sample, () => {
			const input = fs.readFileSync(path.join(cwd, 'input.css'), 'utf-8');
			const actual = JSON.parse(JSON.stringify(parse(input)));

			if (process.env.UPDATE_SNAPSHOTS) {
				fs.writeFileSync(path.join(cwd, 'output.json'), JSON.stringify(actual, null, '\t') + '\n');
			} else {
				fs.writeFileSync(path.join(cwd, '_actual.json'), JSON.stringify(actual, null, '\t'));

				const expected = JSON.parse(fs.readFileSync(path.join(cwd, 'output.json'), 'utf-8'));
				assert.deepEqual(actual, expected);
			}
		});
	}
}
