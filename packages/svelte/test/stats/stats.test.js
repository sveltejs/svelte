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

			const expected_error = try_load_json(`${__dirname}/samples/${dir}/error.json`);

			let result;
			let error;

			try {
				result = svelte.compile(input, config.options);
				config.test(assert, result.stats);
			} catch (e) {
				error = e;
			}

			if (error || expected_error) {
				if (error && !expected_error) {
					throw error;
				}

				if (expected_error && !error) {
					throw new Error(`Expected an error: ${expected_error.message}`);
				}

				assert.equal(error.message, expected_error.message);
				assert.deepEqual(error.start, expected_error.start);
				assert.deepEqual(error.end, expected_error.end);
				assert.equal(error.pos, expected_error.pos);
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
