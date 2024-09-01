import * as fs from 'node:fs';
import { assert, expect } from 'vitest';
import { compile, compileModule, type CompileError } from 'svelte/compiler';
import { suite, type BaseTest } from '../suite';
import { read_file } from '../helpers.js';

interface CompilerErrorTest extends BaseTest {
	error:
		| {
				code: string;
				message: string;
				position?: [number, number];
		  }
		| false;
}

const { test, run } = suite<CompilerErrorTest>((config, cwd) => {
	if (!fs.existsSync(`${cwd}/main.svelte`) && !fs.existsSync(`${cwd}/main.svelte.js`)) {
		throw new Error('Expected main.svelte or main.svelte.js');
	}

	if (fs.existsSync(`${cwd}/main.svelte`)) {
		let caught_error: CompileError | null = null;

		try {
			compile(read_file(`${cwd}/main.svelte`), {
				generate: 'client'
			});
		} catch (e) {
			const error = e as CompileError;

			caught_error = error;

			if (config.error) {
				expect(error.code).toBe(config.error.code);
				expect(error.message).toBe(config.error.message);

				if (config.error.position) {
					expect(error.position).toEqual(config.error.position);
				}
			}
		}

		if (config.error && caught_error == null) {
			assert.fail('Expected an error');
		} else if (!config.error && caught_error != null) {
			assert.fail(`Unexpected error: ${caught_error.code}`);
		}
	}

	if (fs.existsSync(`${cwd}/main.svelte.js`)) {
		let caught_error: CompileError | null = null;

		try {
			compileModule(read_file(`${cwd}/main.svelte.js`), {
				generate: 'client'
			});
		} catch (e) {
			const error = e as CompileError;

			caught_error = error;

			if (config.error) {
				expect(error.code).toEqual(config.error.code);
				expect(error.message).toEqual(config.error.message);

				if (config.error.position) {
					expect(error.position).toEqual(config.error.position);
				}
			}
		}

		if (config.error && caught_error == null) {
			assert.fail('Expected an error');
		} else if (!config.error && caught_error != null) {
			assert.fail(`Unexpected error: ${caught_error.code}`);
		}
	}
});

export { test };

await run(__dirname);
