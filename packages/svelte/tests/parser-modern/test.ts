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

	// run `UPDATE_SNAPSHOTS=true pnpm test parser` to update parser tests
	if (process.env.UPDATE_SNAPSHOTS) {
		fs.writeFileSync(`${cwd}/output.json`, JSON.stringify(actual, null, '\t') + '\n');
	} else {
		fs.writeFileSync(`${cwd}/_actual.json`, JSON.stringify(actual, null, '\t'));

		const expected = try_load_json(`${cwd}/output.json`);

		if (!expected.comments) {
			delete actual.comments;
		}

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

		if (!actual.comments) {
			delete reparsed.comments;
		}

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

// All two-code-point names from https://html.spec.whatwg.org/entities.json
it.each<[string, string]>([
	['NotEqualTilde;', '\u2242\u0338'],
	['NotGreaterFullEqual;', '\u2267\u0338'],
	['NotGreaterGreater;', '\u226b\u0338'],
	['NotGreaterSlantEqual;', '\u2a7e\u0338'],
	['NotHumpDownHump;', '\u224e\u0338'],
	['NotHumpEqual;', '\u224f\u0338'],
	['NotLeftTriangleBar;', '\u29cf\u0338'],
	['NotLessLess;', '\u226a\u0338'],
	['NotLessSlantEqual;', '\u2a7d\u0338'],
	['NotNestedGreaterGreater;', '\u2aa2\u0338'],
	['NotNestedLessLess;', '\u2aa1\u0338'],
	['NotPrecedesEqual;', '\u2aaf\u0338'],
	['NotRightTriangleBar;', '\u29d0\u0338'],
	['NotSquareSubset;', '\u228f\u0338'],
	['NotSquareSuperset;', '\u2290\u0338'],
	['NotSubset;', '\u2282\u20d2'],
	['NotSucceedsEqual;', '\u2ab0\u0338'],
	['NotSucceedsTilde;', '\u227f\u0338'],
	['NotSuperset;', '\u2283\u20d2'],
	['ThickSpace;', '\u205f\u200a'],
	['acE;', '\u223e\u0333'],
	['bne;', '\u003d\u20e5'],
	['bnequiv;', '\u2261\u20e5'],
	['caps;', '\u2229\ufe00'],
	['cups;', '\u222a\ufe00'],
	['fjlig;', '\u0066\u006a'],
	['gesl;', '\u22db\ufe00'],
	['gvertneqq;', '\u2269\ufe00'],
	['gvnE;', '\u2269\ufe00'],
	['lates;', '\u2aad\ufe00'],
	['lesg;', '\u22da\ufe00'],
	['lvertneqq;', '\u2268\ufe00'],
	['lvnE;', '\u2268\ufe00'],
	['nGg;', '\u22d9\u0338'],
	['nGt;', '\u226b\u20d2'],
	['nGtv;', '\u226b\u0338'],
	['nLl;', '\u22d8\u0338'],
	['nLt;', '\u226a\u20d2'],
	['nLtv;', '\u226a\u0338'],
	['nang;', '\u2220\u20d2'],
	['napE;', '\u2a70\u0338'],
	['napid;', '\u224b\u0338'],
	['nbump;', '\u224e\u0338'],
	['nbumpe;', '\u224f\u0338'],
	['ncongdot;', '\u2a6d\u0338'],
	['nedot;', '\u2250\u0338'],
	['nesim;', '\u2242\u0338'],
	['ngE;', '\u2267\u0338'],
	['ngeqq;', '\u2267\u0338'],
	['ngeqslant;', '\u2a7e\u0338'],
	['nges;', '\u2a7e\u0338'],
	['nlE;', '\u2266\u0338'],
	['nleqq;', '\u2266\u0338'],
	['nleqslant;', '\u2a7d\u0338'],
	['nles;', '\u2a7d\u0338'],
	['notinE;', '\u22f9\u0338'],
	['notindot;', '\u22f5\u0338'],
	['nparsl;', '\u2afd\u20e5'],
	['npart;', '\u2202\u0338'],
	['npre;', '\u2aaf\u0338'],
	['npreceq;', '\u2aaf\u0338'],
	['nrarrc;', '\u2933\u0338'],
	['nrarrw;', '\u219d\u0338'],
	['nsce;', '\u2ab0\u0338'],
	['nsubE;', '\u2ac5\u0338'],
	['nsubset;', '\u2282\u20d2'],
	['nsubseteqq;', '\u2ac5\u0338'],
	['nsucceq;', '\u2ab0\u0338'],
	['nsupE;', '\u2ac6\u0338'],
	['nsupset;', '\u2283\u20d2'],
	['nsupseteqq;', '\u2ac6\u0338'],
	['nvap;', '\u224d\u20d2'],
	['nvge;', '\u2265\u20d2'],
	['nvgt;', '\u003e\u20d2'],
	['nvle;', '\u2264\u20d2'],
	['nvlt;', '\u003c\u20d2'],
	['nvltrie;', '\u22b4\u20d2'],
	['nvrtrie;', '\u22b5\u20d2'],
	['nvsim;', '\u223c\u20d2'],
	['race;', '\u223d\u0331'],
	['smtes;', '\u2aac\ufe00'],
	['sqcaps;', '\u2293\ufe00'],
	['sqcups;', '\u2294\ufe00'],
	['varsubsetneq;', '\u228a\ufe00'],
	['varsubsetneqq;', '\u2acb\ufe00'],
	['varsupsetneq;', '\u228b\ufe00'],
	['varsupsetneqq;', '\u2acc\ufe00'],
	['vnsub;', '\u2282\u20d2'],
	['vnsup;', '\u2283\u20d2'],
	['vsubnE;', '\u2acb\ufe00'],
	['vsubne;', '\u228a\ufe00'],
	['vsupnE;', '\u2acc\ufe00'],
	['vsupne;', '\u228b\ufe00']
])('Decodes both code points of &%s', (name, expected) => {
	const raw = `&${name}`;
	const ast = parse(`<p title="${raw}" data-unquoted=${raw}>${raw}</p>`, { modern: true });
	const p = ast.fragment.nodes[0] as AST.RegularElement;

	assert.equal((p.fragment.nodes[0] as AST.Text).data, expected);
	for (const attribute of p.attributes as AST.Attribute[]) {
		assert.ok(Array.isArray(attribute.value));
		assert.equal((attribute.value[0] as AST.Text).data, expected);
	}
});
