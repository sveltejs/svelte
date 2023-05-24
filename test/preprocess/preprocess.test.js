import * as fs from 'node:fs';
import * as svelte from 'svelte/compiler';
import { describe, it } from 'vitest';
import { try_load_config } from '../helpers.js';

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
			const input = fs
				.readFileSync(`${__dirname}/samples/${dir}/input.svelte`, 'utf-8')
				.replace(/\r\n/g, '\n');

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

			if (fs.existsSync(`${__dirname}/samples/${dir}/expected_map.json`)) {
				const expected_map = JSON.parse(
					fs.readFileSync(`${__dirname}/samples/${dir}/expected_map.json`, 'utf-8')
				);
				// You can use https://sokra.github.io/source-map-visualization/#custom to visualize the source map
				expect(JSON.parse(JSON.stringify(result.map))).toEqual(expected_map);
			}
		});
	}
});
