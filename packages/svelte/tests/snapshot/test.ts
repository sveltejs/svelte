import * as fs from 'node:fs';
import { assert, expect } from 'vitest';
import glob from 'tiny-glob/sync.js';
import { compile_directory } from '../helpers.js';
import { suite, type BaseTest } from '../suite.js';
import { VERSION } from 'svelte/compiler';

interface SnapshotTest extends BaseTest {
	compileOptions?: Partial<import('#compiler').CompileOptions>;
}

const { test, run } = suite<SnapshotTest>(async (config, cwd) => {
	await compile_directory(cwd, 'client', config.compileOptions);
	await compile_directory(cwd, 'server', config.compileOptions);

	// run `UPDATE_SNAPSHOTS=true pnpm test snapshot` to update snapshot tests
	if (process.env.UPDATE_SNAPSHOTS) {
		fs.rmSync(`${cwd}/_expected`, { recursive: true, force: true });
		fs.cpSync(`${cwd}/_output`, `${cwd}/_expected`, { recursive: true, force: true });
	} else {
		const actual = glob('**', { cwd: `${cwd}/_output`, filesOnly: true });
		const expected = glob('**', { cwd: `${cwd}/_expected`, filesOnly: true });

		assert.deepEqual(actual, expected);

		for (const file of actual) {
			const actual_content = fs
				.readFileSync(`${cwd}/_output/${file}`, 'utf-8')
				.replaceAll('\r\n', '\n')
				.trimEnd()
				.replace(`v${VERSION}`, 'VERSION');
			const expected_content = fs
				.readFileSync(`${cwd}/_expected/${file}`, 'utf-8')
				.replaceAll('\r\n', '\n')
				.trimEnd();

			expect(actual_content).toBe(expected_content);
		}
	}
});

export { test };

await run(__dirname);
