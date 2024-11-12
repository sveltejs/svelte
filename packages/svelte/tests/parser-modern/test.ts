import * as fs from 'node:fs';
import { assert, it } from 'vitest';
import { parse } from 'svelte/compiler';
import { parse as internal_parse } from '../../src/compiler/phases/1-parse/index.js';
import { try_load_json } from '../helpers.js';
import { suite, type BaseTest } from '../suite.js';
import { remove_typescript_nodes } from '../../src/compiler/phases/1-parse/remove_typescript_nodes.js';

interface ParserTest extends BaseTest {}

const { test, run } = suite<ParserTest>(async (config, cwd) => {
	const input = fs
		.readFileSync(`${cwd}/input.svelte`, 'utf-8')
		.replace(/\s+$/, '')
		.replace(/\r/g, '');

	const actual = JSON.parse(
		JSON.stringify(
			parse(input, {
				modern: true
			})
		)
	);

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

it('Strips BOM from the input', () => {
	const input = '\uFEFF<div></div>';
	const actual = parse(input, { modern: true });
	assert.deepEqual(JSON.parse(JSON.stringify(actual.fragment)), {
		type: 'Fragment',
		nodes: [
			{
				attributes: [],
				end: 11,
				fragment: {
					nodes: [],
					type: 'Fragment'
				},
				name: 'div',
				start: 0,
				type: 'RegularElement'
			}
		]
	});
});

it('Preserves correct parent pointers after stripping TypeScript nodes', () => {
	const input = `<script lang="ts"></script>
	
	<div>
		<p class={x as y}>hi</p>
	</div>
	`;
	const prev: any = internal_parse(input);
	const post: any = remove_typescript_nodes(prev);
	assert.equal(prev, post);
	assert.equal(post.fragment.nodes[1].fragment.nodes[1].parent, post.fragment.nodes[1]);
});
