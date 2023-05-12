import * as fs from 'fs';
import {describe, test, assert, expect} from "vitest";
import {   tryToLoadJson } from '../../helpers.js';
import * as svelte from "../../../compiler.mjs"

describe('vars', () => {
	fs.readdirSync(`${__dirname}/samples`).forEach((dir) => {
		if (dir[0] === '.') return;

		// add .solo to a sample directory name to only run that test
		const solo = /\.solo/.test(dir);
		const skip = /\.skip/.test(dir);

		if (solo && process.env.CI) {
			throw new Error('Forgot to remove `solo: true` from test');
		}

		const test_fn = solo ? test.only : skip ? test.skip : test;

		for (const generate of ['dom', 'ssr', false]) {
			test_fn(`${dir}, generate: ${generate}`, async () => {
				const filename = `${__dirname}/samples/${dir}/input.svelte`;
				const input = fs.readFileSync(filename, 'utf-8').replace(/\s+$/, '');

				let result;
				let error;

				const { options, test } = (await import(`./samples/${dir}/_config.mjs`)).default;

				try {
					result = svelte.compile(input, { ...options, generate });
					test(assert, result.vars)
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
