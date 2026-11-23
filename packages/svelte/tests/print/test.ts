import * as fs from 'node:fs';
import { assert, it } from 'vitest';
import { compile, parse, print } from 'svelte/compiler';
import { suite, type BaseTest } from '../suite.js';

interface PrintTest extends BaseTest {
	check_semantics?: boolean;
}

const { test, run } = suite<PrintTest>(async (config, cwd) => {
	const input = fs.readFileSync(`${cwd}/input.svelte`, 'utf-8');

	const ast = parse(input, { modern: true });
	const output = print(ast);
	const outputCode = output.code.endsWith('\n') ? output.code : output.code + '\n';

	// the printed output must itself be valid Svelte — `print` should never emit
	// code that `parse` cannot read back (e.g. CSS escape sequences must round-trip)
	parse(outputCode, { modern: true });

	if (config.check_semantics) {
		for (const generate of ['client', 'server'] as const) {
			assert.equal(compile(outputCode, { generate }).js.code, compile(input, { generate }).js.code);
		}
	}

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

it('preserves trailing comments when printing a tag without its root', () => {
	const ast = parse('{foo(a) /* c */}', { modern: true });
	const before = JSON.stringify(ast);
	assert.equal(print(ast.fragment.nodes[0]).code, '{foo(a) /* c */}');
	assert.equal(print(ast).code, '{foo(a) /* c */}');
	assert.equal(print(ast).code, '{foo(a) /* c */}');
	assert.equal(JSON.stringify(ast), before);
});

it('preserves custom comment callbacks alongside boundary comments', () => {
	const ast = parse('{a /* c */}{b}', { modern: true });
	const output = print(ast, {
		getLeadingComments: (node) =>
			node.type === 'Identifier' ? [{ type: 'Block', value: ' leading ' }] : [],
		getTrailingComments: (node) =>
			node.type === 'Identifier' ? [{ type: 'Block', value: ' trailing ' }] : []
	}).code;
	assert.equal(output, '{/* leading */ a /* trailing */ /* c */}{/* leading */ b /* trailing */}');
	parse(output, { modern: true });
});

it('keeps a comment inside the type annotation of an each block context', () => {
	const input =
		'<script lang="ts"></script>{#each items as row: { a: string /* c */ }[]}{row}{/each}';
	const output = print(parse(input, { modern: true })).code;
	assert.include(output, '{#each items as row: { a: string /* c */ }[]}');
	parse(output, { modern: true });
});

it('prints a comment at the end of a bind getter the same way twice', () => {
	const input = '<b bind:this={() => a[i /* block */ // line\n], (v) => (a[i] = v)} />';
	const output = print(parse(input, { modern: true })).code;
	assert.equal(print(parse(output, { modern: true })).code, output);
});

it('keeps the statement of an empty call with a comment inside a block', () => {
	const input = '<button onclick={() => { a(); b( // line\n) }}></button>{b}';
	assert.include(print(parse(input, { modern: true })).code, '\tb();\n');
});

it.each([
	'{a /* c */}{b}',
	'{a // c\n}{b}',
	'{#if x}{@const a = 1 /* c */}{@const b = 2}{/if}',
	'{#if x}{const a = (1 /* c */)}{const b = 2}{/if}',
	'{#if x}{const a = (1 /* one */ /* two */)}{const b = 2}{/if}',
	'<div class:active={active /* class */}></div>',
	'{foo(a) /* one */ /* two */}{b}',
	'{#if x}{@const a = foo(b) /* one */ /* two */}{@const c = 2}{/if}'
])('preserves client and server compilation for %s', (input) => {
	const output = print(parse(input, { modern: true })).code;
	for (const generate of ['client', 'server'] as const) {
		assert.equal(compile(output, { generate }).js.code, compile(input, { generate }).js.code);
	}
});
