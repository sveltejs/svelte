import * as fs from 'node:fs';
import * as path from 'node:path';
import { assert, describe, expect, it } from 'vitest';
import { compile } from 'svelte/compiler';

const configs = import.meta.glob('./samples/*/_config.js', { import: 'default', eager: true });

describe('compiler-errors', () => {
	function run_test(dir) {
		if (dir[0] === '.') return;

		const config = configs[`./samples/${dir}/_config.js`];

		assert.ok(config, `Missing config for ${dir}`);

		const solo = config.solo || /\.solo/.test(dir);

		const it_fn = config.skip ? it.skip : solo ? it.only : it;

		it_fn(dir, () => {
			const cwd = path.resolve(`${__dirname}/samples/${dir}`);

			const compileOptions = Object.assign({}, config.compileOptions || {}, {
				immutable: config.immutable,
				accessors: 'accessors' in config ? config.accessors : true,
				generate: 'dom'
			});

			try {
				compile(fs.readFileSync(`${cwd}/main.svelte`, 'utf-8'), compileOptions);
			} catch (error) {
				if (typeof config.error === 'function') {
					config.error(assert, error);
				} else {
					expect(error.message).toMatch(config.error);
				}

				return;
			}

			assert.fail('Expected an error');
		});
	}

	const samples = fs.readdirSync(`${__dirname}/samples`);
	samples.forEach((sample) => run_test(sample));
});
