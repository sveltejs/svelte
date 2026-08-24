import * as fs from 'node:fs';
import { assert } from 'vitest';
import { parse, print } from 'svelte/compiler';
import { suite, type BaseTest } from '../suite.js';

interface PrintTest extends BaseTest {}

const { test, run } = suite<PrintTest>(async (config, cwd) => {
	const input = fs.readFileSync(`${cwd}/input.svelte`, 'utf-8');

	const ast = parse(input, { modern: true });
	const output = print(ast);
	const outputCode = output.code.endsWith('\n') ? output.code : output.code + '\n';

	// the printed output must itself be valid Svelte — `print` should never emit
	// code that `parse` cannot read back (e.g. CSS escape sequences must round-trip)
	parse(outputCode, { modern: true });

	// run `UPDATE_SNAPSHOTS=true pnpm test print` to update print tests
	if (process.env.UPDATE_SNAPSHOTS) {
		fs.writeFileSync(`${cwd}/output.svelte`, outputCode);
	} else {
		fs.writeFileSync(`${cwd}/_actual.svelte`, outputCode);

		const file = `${cwd}/output.svelte`;

		const expected = fs.existsSync(file) ? fs.readFileSync(file, 'utf-8') : '';
		assert.deepEqual(outputCode.trim().replaceAll('\r', ''), expected.trim().replaceAll('\r', ''));
	}
});

export { test };

await run(__dirname);
