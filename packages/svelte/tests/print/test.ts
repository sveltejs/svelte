import * as fs from 'node:fs';
import { assert } from 'vitest';
import { parse, print } from 'svelte/compiler';
import { suite, type BaseTest } from '../suite.js';

interface ParserTest extends BaseTest {}

const { test, run } = suite<ParserTest>(async (config, cwd) => {
	const input = fs.readFileSync(`${cwd}/input.svelte`, 'utf-8');

	const ast = parse(input, { modern: true });
	const output = print(ast);

	// run `UPDATE_SNAPSHOTS=true pnpm test print` to update print tests
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
