import * as fs from 'node:fs';
import { assert, it } from 'vitest';
import { parse, print } from 'svelte/compiler';
import { try_load_json } from '../helpers.js';
import { suite, type BaseTest } from '../suite.js';
import { walk } from 'zimmerframe';

interface ParserTest extends BaseTest {}

const { test, run } = suite<ParserTest>(async (config, cwd) => {
	const loose = cwd.split('/').pop()!.startsWith('loose-');

	const input = fs
		.readFileSync(`${cwd}/input.svelte`, 'utf-8')
		.replace(/\s+$/, '')
		.replace(/\r/g, '');

	const actual = JSON.parse(
		JSON.stringify(
			parse(input, {
				modern: true,
				loose: cwd.split('/').pop()!.startsWith('loose-')
			})
		)
	);

	delete actual.comments;

	// run `UPDATE_SNAPSHOTS=true pnpm test parser` to update parser tests
	if (process.env.UPDATE_SNAPSHOTS) {
		fs.writeFileSync(`${cwd}/output.json`, JSON.stringify(actual, null, '\t'));
	} else {
		fs.writeFileSync(`${cwd}/_actual.json`, JSON.stringify(actual, null, '\t'));

		const expected = try_load_json(`${cwd}/output.json`);
		assert.deepEqual(actual, expected);
	}

	if (!loose) {
		const printed = print(actual);
		const reparsed = JSON.parse(
			JSON.stringify(
				parse(printed.code, {
					modern: true,
					loose
				})
			)
		);

		fs.writeFileSync(`${cwd}/_actual.svelte`, printed.code);

		delete reparsed.comments;

		assert.deepEqual(clean(actual), clean(reparsed));
	}
});

function clean(ast: import('svelte/compiler').AST.SvelteNode) {
	return walk(ast, null, {
		_(node, context) {
			// @ts-ignore
			delete node.start;
			// @ts-ignore
			delete node.end;
			// @ts-ignore
			delete node.loc;
			// @ts-ignore
			delete node.leadingComments;
			// @ts-ignore
			delete node.trailingComments;

			context.next();
		},
		Fragment(node, context) {
			return {
				...node,
				nodes: node.nodes
					.map((child, i) => {
						if (child.type === 'Text') {
							if (i === 0) {
								child = { ...child, data: child.data.trimStart() };
							}

							if (i === node.nodes.length - 1) {
								child = { ...child, data: child.data.trimEnd() };
							}

							if (!child.data) return null;
						}
					})
					.filter(Boolean)
			};
		}
	});
}

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
