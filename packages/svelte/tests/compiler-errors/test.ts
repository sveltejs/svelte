import * as fs from 'node:fs';
import { assert, expect, it } from 'vitest';
import { compile, compileModule, type CompileError } from 'svelte/compiler';
import { suite, type BaseTest } from '../suite';
import { read_file } from '../helpers.js';

interface CompilerErrorTest extends BaseTest {
	async?: boolean;
	error: {
		code: string;
		message: string;
		position?: [number, number];
	};
}

/**
 * Remove the "https://svelte.dev/e/..." link
 */
function strip_link(message: string) {
	return message.slice(0, message.lastIndexOf('\n'));
}

const { test, run } = suite<CompilerErrorTest>((config, cwd) => {
	if (!fs.existsSync(`${cwd}/main.svelte`) && !fs.existsSync(`${cwd}/main.svelte.js`)) {
		throw new Error('Expected main.svelte or main.svelte.js');
	}

	if (fs.existsSync(`${cwd}/main.svelte`)) {
		let caught_error = false;

		try {
			compile(read_file(`${cwd}/main.svelte`), {
				generate: 'client',
				experimental: { async: config.async ?? false }
			});
		} catch (e) {
			const error = e as CompileError;

			caught_error = true;

			expect(error.code).toBe(config.error.code);
			expect(strip_link(error.message)).toBe(config.error.message);

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
			expect(strip_link(error.message)).toEqual(config.error.message);

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

it('rejects invalid runes option values', () => {
	expect(() => {
		compile('<div>hello</div>', { filename: 'foo.svelte', runes: 'invalid' as any });
	}).toThrow();
});

it('accepts runes: "user_land" option', () => {
	// user code (not in node_modules) — should compile in runes mode
	const user_result = compile('<script>let count = $state(0);</script>{count}', {
		filename: '/my/project/src/App.svelte',
		runes: 'user_land'
	});
	expect(user_result.metadata.runes).toBe(true);

	// node_modules code without runes usage — should infer as non-runes
	const lib_result = compile('<script>export let count = 0;</script>{count}', {
		filename: '/my/project/node_modules/lib/Component.svelte',
		runes: 'user_land'
	});
	expect(lib_result.metadata.runes).toBe(false);

	// node_modules code with runes usage — should infer as runes
	const lib_runes_result = compile('<script>let count = $state(0);</script>{count}', {
		filename: '/my/project/node_modules/lib/Component.svelte',
		runes: 'user_land'
	});
	expect(lib_runes_result.metadata.runes).toBe(true);
});

it('resets the compiler state including filename', () => {
	// start with something that succeeds
	compile('<div>hello</div>', { filename: 'foo.svelte' });
	// then try something that fails in the parsing stage
	try {
		compile('<p>hello<div>invalid</p>', { filename: 'bar.svelte' });
		expect.fail('Expected an error');
	} catch (e: any) {
		expect(e.toString()).toContain('bar.svelte');
	}
});
