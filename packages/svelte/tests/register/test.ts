import { execFile } from 'node:child_process';
import * as node_module from 'node:module';
import { promisify } from 'node:util';
import { expect, it } from 'vitest';
import { suite, type BaseTest } from '../suite.js';

interface RegisterTest extends BaseTest {
	/** The JSON printed to stdout by `main.js` */
	expected?: unknown;
	/** Substrings expected in stderr (e.g. compiler warnings) */
	warnings?: string[];
	/** Substring expected in stderr when the process is expected to fail */
	error?: string;
}

const exec = promisify(execFile);

// Each sample runs in its own process so that it goes through Node's resolution and
// module hooks rather than Vite's, and so that every sample loads its own config
const { test, run } = suite<RegisterTest>(async (config, cwd) => {
	const result = await exec(process.execPath, ['--import', 'svelte/register', 'main.js'], {
		cwd,
		// avoid the esm-env warning about missing conditions
		env: { ...process.env, NODE_ENV: 'production' }
	}).then(
		({ stdout, stderr }) => ({ ok: true, stdout, stderr }),
		(error) => ({ ok: false, stdout: error.stdout as string, stderr: error.stderr as string })
	);

	if (config.error) {
		expect(result.ok, 'expected the process to fail').toBe(false);
		expect(result.stderr).toContain(config.error);
		return;
	}

	expect(result.ok, result.stderr).toBe(true);

	for (const warning of config.warnings ?? []) {
		expect(result.stderr).toContain(warning);
	}

	expect(JSON.parse(result.stdout)).toEqual(config.expected);
});

export { test };

// `module.registerHooks` is only available from Node 22.15 / 23.5
if ('registerHooks' in node_module) {
	await run(__dirname);
} else {
	it.skip('[SKIP] svelte/register requires module.registerHooks', () => {});
}
