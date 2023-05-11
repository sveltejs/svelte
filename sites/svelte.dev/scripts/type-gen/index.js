// @ts-check
import fs from 'fs';
import prettier from 'prettier';
import ts from 'typescript';
import { get_bundled_types } from './compile-types.js';

/** @typedef {{ name: string; comment: string; markdown: string; snippet: string; children: Extracted[] }} Extracted */

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

			const export_modifier = modifiers?.find((modifier) => modifier.kind === 93);
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

				// @ts-ignore i think typescript is bad at typescript
				if (statement.jsDoc) {
					// @ts-ignore
					comment = statement.jsDoc[0].comment;
					// @ts-ignore
					start = statement.jsDoc[0].end;
				}

				const i = code.indexOf('export', start);
				start = i + 6;

				/** @type {string[]} */
				const children = [];

				let snippet_unformatted = code.slice(start, statement.end).trim();

				if (ts.isInterfaceDeclaration(statement)) {
					if (statement.members.length > 0) {
						for (const member of statement.members) {
							children.push(munge_type_element(member));
						}

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
						printWidth: 80,
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

				collection.push({ name, comment, snippet, children });
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

	/** @type {string[]} */
	const children = [];

	const name = member.name?.escapedText;
	let snippet = member.getText();

	for (let i = 0; i < depth; i += 1) {
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
			case 'param':
				bullets.push(`- \`${tag.name.getText()}\` ${tag.comment}`);
				break;

			case 'default':
				bullets.push(`- <span class="tag">default</span> \`${tag.comment}\``);
				break;

			case 'returns':
				bullets.push(`- <span class="tag">returns</span> ${tag.comment}`);
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

const bundled_types = await get_bundled_types();

{
	const module = bundled_types.get('svelte');

	if (!module) throw new Error('Could not find svelte');

	modules.push({
		name: 'svelte',
		comment: '',
		...get_types(module.code, module.ts_source_file.statements)
	});
}

{
	const module = bundled_types.get('svelte/compiler');

	if (!module) throw new Error('Could not find svelte/compiler');

	modules.push({
		name: 'svelte/compiler',
		comment: '',
		...get_types(module.code, module.ts_source_file.statements)
	});
}

{
	const module = bundled_types.get('svelte/action');

	if (!module) throw new Error('Could not find svelte/action');

	modules.push({
		name: 'svelte/action',
		comment: '',
		...get_types(module.code, module.ts_source_file.statements)
	});
}

{
	const module = bundled_types.get('svelte/animate');

	if (!module) throw new Error('Could not find svelte/animate');

	modules.push({
		name: 'svelte/animate',
		comment: '',
		...get_types(module.code, module.ts_source_file.statements)
	});
}

{
	const module = bundled_types.get('svelte/easing');

	if (!module) throw new Error('Could not find svelte/easing');

	modules.push({
		name: 'svelte/easing',
		comment: '',
		...get_types(module.code, module.ts_source_file.statements)
	});
}

{
	const module = bundled_types.get('svelte/motion');

	if (!module) throw new Error('Could not find svelte/motion');

	modules.push({
		name: 'svelte/motion',
		comment: '',
		...get_types(module.code, module.ts_source_file.statements)
	});
}

{
	const module = bundled_types.get('svelte/store');

	if (!module) throw new Error('Could not find svelte/store');

	modules.push({
		name: 'svelte/store',
		comment: '',
		...get_types(module.code, module.ts_source_file.statements)
	});
}

{
	const module = bundled_types.get('svelte/transition');

	if (!module) throw new Error('Could not find svelte/transition');

	modules.push({
		name: 'svelte/transition',
		comment: '',
		...get_types(module.code, module.ts_source_file.statements)
	});
}

modules.sort((a, b) => (a.name < b.name ? -1 : 1));

// Fix the duplicate/messed up types
// !NOTE: This relies on mutation of `modules`
$: {
	const module_with_SvelteComponent = modules.find((m) =>
		m.types.filter((t) => t.name === 'SvelteComponent')
	);

	if (!module_with_SvelteComponent) break $;

	const svelte_comp_part = module_with_SvelteComponent?.types.filter(
		(t) => t.name === 'SvelteComponent'
	);

	if (svelte_comp_part?.[1]) {
		// Take the comment from [0], and insert into [1]. Then delete [0]
		svelte_comp_part[1].comment = svelte_comp_part?.[0].comment;
		delete svelte_comp_part[0];
		svelte_comp_part.reverse();
		svelte_comp_part.length = 1;

		module_with_SvelteComponent.types = module_with_SvelteComponent?.types.filter(
			(t) => t.name !== 'SvelteComponent'
		);

		module_with_SvelteComponent.types.push(svelte_comp_part[0]);
		module_with_SvelteComponent.types.sort((a, b) => (a.name < b.name ? -1 : 1));
	}
}

// Fix the duplicate/messed up types
// !NOTE: This relies on mutation of `modules`
$: {
	const module_with_SvelteComponentTyped = modules.find((m) =>
		m.types.filter((t) => t.name === 'SvelteComponentTyped')
	);

	if (!module_with_SvelteComponentTyped) break $;

	const svelte_comp_typed_part = module_with_SvelteComponentTyped?.types.filter(
		(t) => t.name === 'SvelteComponentTyped'
	);

	if (svelte_comp_typed_part?.[1]) {
		// Take the comment from [1], and insert into [0]. Then delete [1]
		svelte_comp_typed_part[0].comment = svelte_comp_typed_part?.[1].comment;
		delete svelte_comp_typed_part[1];
		svelte_comp_typed_part.length = 1;

		module_with_SvelteComponentTyped.types = module_with_SvelteComponentTyped?.types.filter(
			(t) => t.name !== 'SvelteComponentTyped'
		);

		module_with_SvelteComponentTyped.types.push(svelte_comp_typed_part[0]);
		module_with_SvelteComponentTyped.types.sort((a, b) => (a.name < b.name ? -1 : 1));
	}
}

// Remove $$_attributes from ActionReturn

$: {
	const module_with_ActionReturn = modules.find((m) =>
		m.types.find((t) => t.name === 'ActionReturn')
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
/* This file is generated by running \`node scripts/extract-types.js\`
   in the packages/kit directory — do not edit it */
export const modules = ${JSON.stringify(modules, null, '  ')};
`.trim()
);
