import * as fs from 'node:fs';
import * as svelte from '../../src/compiler/index.js';
import { try_load_config } from '../helpers.js';
import { describe, it } from 'vitest';

const samples = fs.readdirSync(`${__dirname}/samples`);

describe('preprocess', async () => {
	await Promise.all(samples.map((dir) => run(dir)));

	async function run(dir) {
		if (dir[0] === '.') return;

		const config = await try_load_config(`${__dirname}/samples/${dir}/_config.js`);
		const solo = config.solo || /\.solo/.test(dir);
		const skip = config.skip || /\.skip/.test(dir);

		const it_fn = skip ? it.skip : solo ? it.only : it;

		it_fn(dir, async ({ expect }) => {
			const input = fs.readFileSync(`${__dirname}/samples/${dir}/input.svelte`, 'utf-8');

			const result = await svelte.preprocess(
				input,
				config.preprocess || {},
				config.options || { filename: 'input.svelte' }
			);
			fs.writeFileSync(`${__dirname}/samples/${dir}/_actual.html`, result.code);

			if (result.map) {
				fs.writeFileSync(
					`${__dirname}/samples/${dir}/_actual.html.map`,
					JSON.stringify(result.map, null, 2)
				);
			}

			expect(result.code).toMatchFileSnapshot(`${__dirname}/samples/${dir}/output.svelte`);

			expect(result.dependencies).toEqual(config.dependencies || []);
		});
	}
});
