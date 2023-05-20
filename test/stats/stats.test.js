import * as fs from 'node:fs';
import { describe, it, assert } from 'vitest';
import * as svelte from 'svelte/compiler';
import { try_load_config, try_load_json } from '../helpers.js';

describe('stats', () => {
	fs.readdirSync(`${__dirname}/samples`).forEach((dir) => {
		if (dir[0] === '.') return;

		// add .solo to a sample directory name to only run that test
		const solo = /\.solo/.test(dir);
		const skip = /\.skip/.test(dir);
		const it_fn = solo ? it.only : skip ? it.skip : it;

		it_fn(dir, async () => {
			const config = await try_load_config(`${__dirname}/samples/${dir}/_config.js`);
			const filename = `${__dirname}/samples/${dir}/input.svelte`;
			const input = fs.readFileSync(filename, 'utf-8').replace(/\s+$/, '');

			const expectedError = try_load_json(`${__dirname}/samples/${dir}/error.json`);

			let result;
			let error;

			try {
				result = svelte.compile(input, config.options);
				config.test(assert, result.stats);
			} catch (e) {
				error = e;
			}

			if (error || expectedError) {
				if (error && !expectedError) {
					throw error;
				}

				if (expectedError && !error) {
					throw new Error(`Expected an error: ${expectedError.message}`);
				}

				assert.equal(error.message, expectedError.message);
				assert.deepEqual(error.start, expectedError.start);
				assert.deepEqual(error.end, expectedError.end);
				assert.equal(error.pos, expectedError.pos);
			}
		});
	});

	it('returns a stats object when options.generate is false', () => {
		const { stats } = svelte.compile('', {
			generate: false
		});

		assert.equal(typeof stats.timings.total, 'number');
	});
});
