import deindent from './utils/deindent';
import list from '../utils/list';
import { ModuleFormat, Node } from '../interfaces';
import { stringify_props } from './utils/stringify_props';

const wrappers = { esm, cjs };

type Export = {
	name: string;
	as: string;
};

export default function create_module(
	code: string,
	format: ModuleFormat,
	name: string,
	banner: string,
	sveltePath = 'svelte',
	helpers: { name: string, alias: string }[],
	imports: Node[],
	module_exports: Export[],
	source: string
): string {
	const internal_path = `${sveltePath}/internal`;

	if (format === 'esm') {
		return esm(code, name, banner, sveltePath, internal_path, helpers, imports, module_exports, source);
	}

	if (format === 'cjs') return cjs(code, name, banner, sveltePath, internal_path, helpers, imports, module_exports);

	throw new Error(`options.format is invalid (must be ${list(Object.keys(wrappers))})`);
}

function edit_source(source, sveltePath) {
	return source === 'svelte' || source.startsWith('svelte/')
		? source.replace('svelte', sveltePath)
		: source;
}

function esm(
	code: string,
	name: string,
	banner: string,
	sveltePath: string,
	internal_path: string,
	helpers: { name: string, alias: string }[],
	imports: Node[],
	module_exports: Export[],
	source: string
) {
	const internal_imports = helpers.length > 0 && (
		`import ${stringify_props(helpers.map(h => h.name === h.alias ? h.name : `${h.name} as ${h.alias}`).sort())} from ${JSON.stringify(internal_path)};`
	);

	const user_imports = imports.length > 0 && (
		imports
			.map((declaration: Node) => {
				const import_source = edit_source(declaration.source.value, sveltePath);

				return (
					source.slice(declaration.start, declaration.source.start) +
					JSON.stringify(import_source) +
					source.slice(declaration.source.end, declaration.end)
				);
			})
			.join('\n')
	);

	return deindent`
		${banner}
		${internal_imports}
		${user_imports}

		${code}

		export default ${name};
		${module_exports.length > 0 && `export { ${module_exports.map(e => e.name === e.as ? e.name : `${e.name} as ${e.as}`).join(', ')} };`}`;
}

function cjs(
	code: string,
	name: string,
	banner: string,
	sveltePath: string,
	internal_path: string,
	helpers: { name: string, alias: string }[],
	imports: Node[],
	module_exports: Export[]
) {
	const declarations = helpers.map(h => `${h.alias === h.name ? h.name : `${h.name}: ${h.alias}`}`).sort();

	const internal_imports = helpers.length > 0 && (
		`const ${stringify_props(declarations)} = require(${JSON.stringify(internal_path)});\n`
	);

	const requires = imports.map(node => {
		let lhs;

		if (node.specifiers[0].type === 'ImportNamespaceSpecifier') {
			lhs = node.specifiers[0].local.name;
		} else {
			const properties = node.specifiers.map(s => {
				if (s.type === 'ImportDefaultSpecifier') {
					return `default: ${s.local.name}`;
				}

				return s.local.name === s.imported.name
					? s.local.name
					: `${s.imported.name}: ${s.local.name}`;
			});

			lhs = `{ ${properties.join(', ')} }`;
		}

		const source = edit_source(node.source.value, sveltePath);

		return `const ${lhs} = require("${source}");`
	});

	const exports = [`exports.default = ${name};`].concat(
		module_exports.map(x => `exports.${x.as} = ${x.name};`)
	);

	return deindent`
		${banner}
		"use strict";

		${internal_imports}
		${requires}

		${code}

		${exports}`
}