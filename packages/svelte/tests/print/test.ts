import * as fs from 'node:fs';
import { assert, it } from 'vitest';
import { parse, print } from 'svelte/compiler';
import { try_load_json } from '../helpers.js';
import { suite, type BaseTest } from '../suite.js';
import { walk } from 'zimmerframe';
import type { AST } from 'svelte/compiler';

interface ParserTest extends BaseTest {}

const { test, run } = suite<ParserTest>(async (config, cwd) => {
	const input = fs.readFileSync(`${cwd}/input.svelte`, 'utf-8');

	const ast = parse(input, { modern: true });
	const output = print(ast);

	// run `UPDATE_SNAPSHOTS=true pnpm test parser` to update parser tests
	if (process.env.UPDATE_SNAPSHOTS) {
		fs.writeFileSync(`${cwd}/output.svelte`, output.code);
	} else {
		fs.writeFileSync(`${cwd}/_actual.svelte`, output.code);

		const file = `${cwd}/output.svelte`;

		const expected = fs.existsSync(file) ? fs.readFileSync(file, 'utf-8') : '';
		assert.deepEqual(output.code.trim().replaceAll('\r', ''), expected.trim().replaceAll('\r', ''));
	}
});

export { test };

await run(__dirname);
