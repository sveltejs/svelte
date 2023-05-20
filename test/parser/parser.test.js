import * as fs from 'node:fs';
import { assert, describe, it } from 'vitest';
import * as svelte from 'svelte/compiler';
import { try_load_json } from '../helpers.js';

describe('parse', () => {
	fs.readdirSync(`${__dirname}/samples`).forEach((dir) => {
		if (dir[0] === '.') return;

		// add .solo to a sample directory name to only run that test
		const solo = /\.solo$/.test(dir);
		const skip = !fs.existsSync(`${__dirname}/samples/${dir}/input.svelte`);
		if (skip) {
			console.warn(
				`skipping ${dir} because no input.svelte exists. This could be a leftover folder from a different branch.`
			);
		}

		const it_fn = skip ? it.skip : solo ? it.only : it;

		it_fn(dir, () => {
			const options = try_load_json(`${__dirname}/samples/${dir}/options.json`) || {};

			const input = fs
				.readFileSync(`${__dirname}/samples/${dir}/input.svelte`, 'utf-8')
				.trimEnd()
				.replace(/\r/g, '');

			const expectedOutput = try_load_json(`${__dirname}/samples/${dir}/output.json`);
			const expectedError = try_load_json(`${__dirname}/samples/${dir}/error.json`);

			try {
				const { ast } = svelte.compile(
					input,
					Object.assign({}, options, {
						generate: false
					})
				);

				fs.writeFileSync(
					`${__dirname}/samples/${dir}/_actual.json`,
					JSON.stringify(ast, null, '\t')
				);

				assert.deepEqual(ast.html, expectedOutput.html);
				assert.deepEqual(ast.css, expectedOutput.css);
				assert.deepEqual(ast.instance, expectedOutput.instance);
				assert.deepEqual(ast.module, expectedOutput.module);
			} catch (err) {
				if (err.name !== 'ParseError') throw err;
				if (!expectedError) throw err;
				const { code, message, pos, start } = err;

				assert.deepEqual({ code, message, pos, start }, expectedError);
			}
		});
	});
});
