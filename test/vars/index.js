import * as fs from 'fs';
import * as assert from 'assert';
import { svelte, loadConfig, tryToLoadJson } from '../helpers';

describe('vars', () => {
	fs.readdirSync(`${__dirname}/samples`).forEach(dir => {
		if (dir[0] === '.') return;

		// add .solo to a sample directory name to only run that test
		const solo = /\.solo/.test(dir);
		const skip = /\.skip/.test(dir);

		if (solo && process.env.CI) {
			throw new Error('Forgot to remove `solo: true` from test');
		}

		for (const generate of ['dom', 'ssr', false]) {
			(solo ? it.only : skip ? it.skip : it)(`${dir}, generate: ${generate}`, () => {
				const config = loadConfig(`${__dirname}/samples/${dir}/_config.js`);
				const filename = `${__dirname}/samples/${dir}/input.svelte`;
				const input = fs.readFileSync(filename, 'utf-8').replace(/\s+$/, '');

				const expectedError = tryToLoadJson(
					`${__dirname}/samples/${dir}/error.json`
				);

				let result;
				let error;

				try {
					result = svelte.compile(input, { ...config.options, generate });
					config.test(assert, result.vars);
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
		}
	});
});
