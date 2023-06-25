// @ts-check
import fs from 'node:fs';
import path from 'node:path';
import prettier from 'prettier';
import ts from 'typescript';

/** @typedef {{
 * name: string;
 * comment: string;
 * markdown?: string;
 * snippet: string;
 * deprecated: string | null;
 * children: Extracted[] }
 * } Extracted */

/** @type {Array<{ name: string; comment: string; exports: Extracted[]; types: Extracted[]; exempt?: boolean; }>} */
const modules = [];

/**
 * @param {string} code
 * @param {ts.NodeArray<ts.Statement>} statements
 */
function get_types(code, statements) {
	/** @type {Extracted[]} */
	const exports = [];

	/** @type {Extracted[]} */
	const types = [];

	if (statements) {
		for (const statement of statements) {
			const modifiers = ts.canHaveModifiers(statement) ? ts.getModifiers(statement) : undefined;

			const export_modifier = modifiers?.find(
				(modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword
			);

			if (!export_modifier) continue;

			if (
				ts.isClassDeclaration(statement) ||
				ts.isInterfaceDeclaration(statement) ||
				ts.isTypeAliasDeclaration(statement) ||
				ts.isModuleDeclaration(statement) ||
				ts.isVariableStatement(statement) ||
				ts.isFunctionDeclaration(statement)
			) {
				const name_node = ts.isVariableStatement(statement)
					? statement.declarationList.declarations[0]
					: statement;

				// @ts-ignore no idea why it's complaining here
				const name = name_node.name?.escapedText;

				let start = statement.pos;
				let comment = '';
				/** @type {string | null} */
				let deprecated_notice = null;

				// @ts-ignore i think typescript is bad at typescript
				if (statement.jsDoc) {
					// @ts-ignore
					const jsDoc = statement.jsDoc[0];

					comment = jsDoc.comment;

					if (jsDoc?.tags?.[0]?.tagName?.escapedText === 'deprecated') {
						deprecated_notice = jsDoc.tags[0].comment;
					}

					// @ts-ignore
					start = jsDoc.end;
				}

				const i = code.indexOf('export', start);
				start = i + 6;

				/** @type {Extracted[]} */
				let children = [];

				let snippet_unformatted = code.slice(start, statement.end).trim();

				if (ts.isInterfaceDeclaration(statement) || ts.isClassDeclaration(statement)) {
					if (statement.members.length > 0) {
						for (const member of statement.members) {
							// @ts-ignore
							children.push(munge_type_element(member));
						}

						children = children.filter(Boolean);

						// collapse `interface Foo {/* lots of stuff*/}` into `interface Foo {…}`
						const first = statement.members.at(0);
						const last = statement.members.at(-1);

						let body_start = first.pos - start;
						while (snippet_unformatted[body_start] !== '{') body_start -= 1;

						let body_end = last.end - start;
						while (snippet_unformatted[body_end] !== '}') body_end += 1;

						snippet_unformatted =
							snippet_unformatted.slice(0, body_start + 1) +
							'/*…*/' +
							snippet_unformatted.slice(body_end);
					}
				}

				const snippet = prettier
					.format(snippet_unformatted, {
						parser: 'typescript',
						printWidth: 60,
						useTabs: true,
						singleQuote: true,
						trailingComma: 'none'
					})
					.replace(/\s*(\/\*…\*\/)\s*/g, '/*…*/')
					.trim();

				const collection =
					ts.isVariableStatement(statement) || ts.isFunctionDeclaration(statement)
						? exports
						: types;

				collection.push({
					name,
					comment,
					snippet,
					children,
					deprecated: deprecated_notice
				});
			}
		}

		types.sort((a, b) => (a.name < b.name ? -1 : 1));
		exports.sort((a, b) => (a.name < b.name ? -1 : 1));
	}

	return { types, exports };
}

/**
 * @param {ts.TypeElement} member
 */
function munge_type_element(member, depth = 1) {
	// @ts-ignore
	const doc = member.jsDoc?.[0];

	if (/(private api|do not use)/i.test(doc?.comment)) return;

	/** @type {string[]} */
	const children = [];

	const name = member.name?.escapedText;
	let snippet = member.getText();

	for (let i = -1; i < depth; i += 1) {
		snippet = snippet.replace(/^\t/gm, '');
	}

	if (
		ts.isPropertySignature(member) &&
		ts.isTypeLiteralNode(member.type) &&
		member.type.members.some((member) => member.jsDoc?.[0].comment)
	) {
		let a = 0;
		while (snippet[a] !== '{') a += 1;

		snippet = snippet.slice(0, a + 1) + '/*…*/}';

		for (const child of member.type.members) {
			children.push(munge_type_element(child, depth + 1));
		}
	}

	/** @type {string[]} */
	const bullets = [];

	for (const tag of doc?.tags ?? []) {
		const type = tag.tagName.escapedText;

		switch (tag.tagName.escapedText) {
			case 'private':
				bullets.push(`- <span class="tag">private</span> ${tag.comment}`);
				break;

			case 'readonly':
				bullets.push(`- <span class="tag">readonly</span> ${tag.comment}`);
				break;

			case 'param':
				bullets.push(`- \`${tag.name.getText()}\` ${tag.comment}`);
				break;

			case 'default':
				bullets.push(`- <span class="tag">default</span> \`${tag.comment}\``);
				break;

			case 'returns':
				bullets.push(`- <span class="tag">returns</span> ${tag.comment}`);
				break;

			case 'deprecated':
				bullets.push(`- <span class="tag deprecated">deprecated</span> ${tag.comment}`);
				break;

			default:
				console.log(`unhandled JSDoc tag: ${type}`); // TODO indicate deprecated stuff
		}
	}

	return {
		name,
		snippet,
		comment: (doc?.comment ?? '')
			.replace(/\/\/\/ type: (.+)/g, '/** @type {$1} */')
			.replace(/^(  )+/gm, (match, spaces) => {
				return '\t'.repeat(match.length / 2);
			}),
		bullets,
		children
	};
}

/**
 * Type declarations include fully qualified URLs so that they become links when
 * you hover over names in an editor with TypeScript enabled. We need to remove
 * the origin so that they become root-relative, so that they work in preview
 * deployments and when developing locally
 * @param {string} str
 */
function strip_origin(str) {
	return str.replace(/https:\/\/svelte\.dev/g, '');
}

/**
 * @param {string} file
 */
function read_d_ts_file(file) {
	const resolved = path.resolve('../../packages/svelte', file);

	// We can't use JSDoc comments inside JSDoc, so we would get ts(7031) errors if
	// we didn't ignore this error specifically for `/// file:` code examples
	const str = fs.readFileSync(resolved, 'utf-8');

	return str.replace(/(\s*\*\s*)```js([\s\S]+?)```/g, (match, prefix, code) => {
		return `${prefix}\`\`\`js${prefix}// @errors: 7031${code}\`\`\``;
	});
}

{
	const code = read_d_ts_file('types/index.d.ts');
	const node = ts.createSourceFile('index.d.ts', code, ts.ScriptTarget.Latest, true);

	for (const statement of node.statements) {
		if (ts.isModuleDeclaration(statement)) {
			// @ts-ignore
			const name = statement.name.text || statement.name.escapedText;

			const ignore_list = [
				'*.svelte',
				'svelte/types/compiler/preprocess', // legacy entrypoints, omit from docs
				'svelte/types/compiler/interfaces' // legacy entrypoints, omit from docs
			];
			if (ignore_list.includes(name)) {
				continue;
			}

			// @ts-ignore
			const comment = strip_origin(statement.jsDoc?.[0].comment ?? '');

			modules.push({
				name,
				comment,
				// @ts-ignore
				...get_types(code, statement.body?.statements)
			});
		}
	}
}

modules.sort((a, b) => (a.name < b.name ? -1 : 1));

// Remove $$_attributes from ActionReturn
$: {
	const module_with_ActionReturn = modules.find((m) =>
		m.types.find((t) => t?.name === 'ActionReturn')
	);

	const new_children =
		module_with_ActionReturn?.types[1].children.filter((c) => c.name !== '$$_attributes') || [];

	if (!module_with_ActionReturn) break $;

	module_with_ActionReturn.types[1].children = new_children;
}

try {
	fs.mkdirSync(new URL('../../src/lib/generated', import.meta.url), { recursive: true });
} catch {}

fs.writeFileSync(
	new URL('../../src/lib/generated/type-info.js', import.meta.url),
	`
/* This file is generated by running \`pnpm generate\`
   in the sites/svelte.dev directory — do not edit it */
export const modules = /** @type {import('@sveltejs/site-kit/markdown').Modules} */ (${JSON.stringify(
		modules,
		null,
		'  '
	)});
`.trim()
);
