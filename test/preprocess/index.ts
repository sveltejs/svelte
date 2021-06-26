import * as fs from 'fs';
import * as assert from 'assert';
import { loadConfig, svelte } from '../helpers';

describe('preprocess', () => {
	fs.readdirSync(`${__dirname}/samples`).forEach(dir => {
		if (dir[0] === '.') return;

		const config = loadConfig(`${__dirname}/samples/${dir}/_config.js`);
		const solo = config.solo || /\.solo/.test(dir);
		const skip = config.skip || /\.skip/.test(dir);

		if (solo && process.env.CI) {
			throw new Error('Forgot to remove `solo: true` from test');
		}

		(skip ? it.skip : solo ? it.only : it)(dir, async () => {
			const input = fs.readFileSync(`${__dirname}/samples/${dir}/input.svelte`, 'utf-8');
			const expected = fs.readFileSync(`${__dirname}/samples/${dir}/output.svelte`, 'utf-8');

			const result = await svelte.preprocess(
				input,
				config.preprocess || {},
				config.options || { filename: 'input.svelte' }
			);
			fs.writeFileSync(`${__dirname}/samples/${dir}/_actual.html`, result.code);
			if (result.map) {
				fs.writeFileSync(`${__dirname}/samples/${dir}/_actual.html.map`, JSON.stringify(result.map, null, 2));
			}

			assert.equal(result.code, expected);

			assert.deepEqual(result.dependencies, config.dependencies || []);
		});
	});
});
