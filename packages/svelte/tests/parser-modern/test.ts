import * as fs from 'node:fs';
import { assert, it } from 'vitest';
import { parse, print } from 'svelte/compiler';
import { try_load_json } from '../helpers.js';
import { suite, type BaseTest } from '../suite.js';
import { walk } from 'zimmerframe';
import type { AST } from 'svelte/compiler';

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
		fs.writeFileSync(`${cwd}/output.json`, JSON.stringify(actual, null, '\t') + '\n');
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

function clean(ast: AST.SvelteNode) {
	return walk(ast, null, {
		_(node, context) {
			// @ts-ignore
			delete node.start;
			// @ts-ignore
			delete node.end;
			// @ts-ignore
			delete node.loc;
			// @ts-ignore
			delete node.name_loc;
			// @ts-ignore
			delete node.leadingComments;
			// @ts-ignore
			delete node.trailingComments;

			context.next();
		},
		StyleSheet(node, context) {
			return {
				type: node.type,
				attributes: node.attributes.map((attribute) => context.visit(attribute)),
				children: node.children.map((child) => context.visit(child)),
				content: {}
			} as AST.SvelteNode;
		},
		Fragment(node, context) {
			const nodes: AST.SvelteNode[] = [];

			for (let i = 0; i < node.nodes.length; i += 1) {
				let child = node.nodes[i];

				if (child.type === 'Text') {
					child = {
						...child,
						// trim multiple whitespace to single space
						data: child.data.replace(/[^\S]+/g, ' '),
						raw: child.raw.replace(/[^\S]+/g, ' ')
					};

					if (i === 0) {
						child.data = child.data.trimStart();
						child.raw = child.raw.trimStart();
					}

					if (i === node.nodes.length - 1) {
						child.data = child.data.trimEnd();
						child.raw = child.raw.trimEnd();
					}

					if (child.data === '') continue;
				}

				nodes.push(context.visit(child));
			}

			return { ...node, nodes } as AST.Fragment;
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
				name_loc: {
					end: {
						character: 4,
						column: 4,
						line: 1
					},
					start: {
						character: 1,
						column: 1,
						line: 1
					}
				},
				name: 'div',
				start: 0,
				type: 'RegularElement'
			}
		]
	});
});
