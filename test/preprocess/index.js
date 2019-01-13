import * as fs from 'fs';
import * as assert from 'assert';
import { loadConfig, svelte } from '../helpers.js';

describe.only('preprocess', () => {
	fs.readdirSync('test/preprocess/samples').forEach(dir => {
		if (dir[0] === '.') return;

		const config = loadConfig(`./preprocess/samples/${dir}/_config.js`);

		if (config.solo && process.env.CI) {
			throw new Error('Forgot to remove `solo: true` from test');
		}

		(config.skip ? it.skip : config.solo ? it.only : it)(dir, async () => {
			const input = fs.readFileSync(`test/preprocess/samples/${dir}/input.html`, 'utf-8');
			const expected = fs.readFileSync(`test/preprocess/samples/${dir}/output.html`, 'utf-8');

			const actual = await svelte.preprocess(input, config.preprocess);
			fs.writeFileSync(`test/preprocess/samples/${dir}/_actual.html`, actual);

			assert.equal(actual, expected);
		});
	});
});
