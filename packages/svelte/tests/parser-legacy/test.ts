import * as fs from 'node:fs';
import { assert } from 'vitest';
import { parse } from 'svelte/compiler';
import { try_load_json } from '../helpers.js';
import { suite, type BaseTest } from '../suite.js';

interface ParserTest extends BaseTest {}

const { test, run } = suite<ParserTest>(async (config, cwd) => {
	const input = fs
		.readFileSync(`${cwd}/input.svelte`, 'utf-8')
		.replace(/\s+$/, '')
		.replace(/\r/g, '');

	const actual = JSON.parse(JSON.stringify(parse(input)));

	// run `UPDATE_SNAPSHOTS=true pnpm test parser` to update parser tests
	if (process.env.UPDATE_SNAPSHOTS) {
		fs.writeFileSync(`${cwd}/output.json`, JSON.stringify(actual, null, '\t'));
	} else {
		fs.writeFileSync(`${cwd}/_actual.json`, JSON.stringify(actual, null, '\t'));

		const expected = try_load_json(`${cwd}/output.json`);
		assert.deepEqual(actual, expected);
	}
});

export { test };

await run(__dirname);
