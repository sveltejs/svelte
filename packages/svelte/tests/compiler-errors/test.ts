import * as fs from 'node:fs';
import { assert, expect } from 'vitest';
import { compile, compileModule, type CompileError } from 'svelte/compiler';
import { suite, type BaseTest } from '../suite';
import { read_file } from '../helpers.js';

interface CompilerErrorTest extends BaseTest {
	error: {
		code: string;
		message: string;
		position?: [number, number];
	};
}

const { test, run } = suite<CompilerErrorTest>((config, cwd) => {
	if (!fs.existsSync(`${cwd}/main.svelte`) && !fs.existsSync(`${cwd}/main.svelte.js`)) {
		throw new Error('Expected main.svelte or main.svelte.js');
	}

	if (fs.existsSync(`${cwd}/main.svelte`)) {
		let caught_error = false;

		try {
			compile(read_file(`${cwd}/main.svelte`), {
				generate: 'client'
			});
		} catch (e) {
			const error = e as CompileError;

			caught_error = true;

			expect(error.code).toBe(config.error.code);
			expect(error.message).toBe(config.error.message);

			if (config.error.position) {
				expect(error.position).toEqual(config.error.position);
			}
		}

		if (!caught_error) {
			assert.fail('Expected an error');
		}
	}

	if (fs.existsSync(`${cwd}/main.svelte.js`)) {
		let caught_error = false;

		try {
			compileModule(read_file(`${cwd}/main.svelte.js`), {
				generate: 'client'
			});
		} catch (e) {
			const error = e as CompileError;

			caught_error = true;

			expect(error.code).toEqual(config.error.code);
			expect(error.message).toEqual(config.error.message);

			if (config.error.position) {
				expect(error.position).toEqual(config.error.position);
			}
		}

		if (!caught_error) {
			assert.fail('Expected an error');
		}
	}
});

export { test };

await run(__dirname);
