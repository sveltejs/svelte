import * as fs from 'node:fs';
import { assert } from 'vitest';
import { migrate } from 'svelte/compiler';
import { try_read_file } from '../helpers.js';
import { suite, type BaseTest } from '../suite.js';

interface ParserTest extends BaseTest {}

const { test, run } = suite<ParserTest>(async (config, cwd) => {
	const input = fs
		.readFileSync(`${cwd}/input.svelte`, 'utf-8')
		.replace(/\s+$/, '')
		.replace(/\r/g, '');

	const actual = migrate(input).code;

	// run `UPDATE_SNAPSHOTS=true pnpm test migrate` to update parser tests
	if (process.env.UPDATE_SNAPSHOTS || !fs.existsSync(`${cwd}/output.svelte`)) {
		fs.writeFileSync(`${cwd}/output.svelte`, actual);
	} else {
		fs.writeFileSync(`${cwd}/_actual.svelte`, actual);

		const expected = try_read_file(`${cwd}/output.svelte`);
		assert.deepEqual(actual, expected);
	}
});

export { test };

await run(__dirname);
