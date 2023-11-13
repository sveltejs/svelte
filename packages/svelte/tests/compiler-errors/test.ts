import * as fs from 'node:fs';
import { assert, expect } from 'vitest';
import { compile, compileModule, type CompileError } from 'svelte/compiler';
import { suite, type BaseTest } from '../suite';

interface CompilerErrorTest extends BaseTest {
	error: {
		code: string;
		message: string;
		position?: [number, number];
	};
}

const { test, run } = suite<CompilerErrorTest>((config, cwd) => {
	if (fs.existsSync(`${cwd}/main.svelte`)) {
		let caught_error = false;

		try {
			compile(fs.readFileSync(`${cwd}/main.svelte`, 'utf-8'), {
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

	if (fs.existsSync(`${cwd}/main.js`)) {
		let caught_error = false;

		try {
			compileModule(fs.readFileSync(`${cwd}/main.js`, 'utf-8'), {
				generate: 'client'
			});
		} catch (e) {
			const error = e as CompileError;

			caught_error = true;

			expect(error.code).toMatch(config.error.code);
			expect(error.message).toMatch(config.error.message);
		}

		if (!caught_error) {
			assert.fail('Expected an error');
		}
	}
});

export { test };

await run(__dirname);
