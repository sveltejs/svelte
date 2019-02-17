import deindent from '../utils/deindent';
import list from '../utils/list';
import { CompileOptions, ModuleFormat, Node } from '../interfaces';

interface Dependency {
	name: string;
	statements: string[];
	source: string;
}

const wrappers = { esm, cjs };

type Export = {
	name: string;
	as: string;
};

export default function wrapModule(
	code: string,
	format: ModuleFormat,
	name: string,
	options: CompileOptions,
	banner: string,
	sveltePath = 'svelte',
	helpers: { name: string, alias: string }[],
	imports: Node[],
	module_exports: Export[],
	source: string
): string {
	const internalPath = `${sveltePath}/internal`;

	if (format === 'esm') {
		return esm(code, name, options, banner, sveltePath, internalPath, helpers, imports, module_exports, source);
	}

	if (format === 'cjs') return cjs(code, name, banner, sveltePath, internalPath, helpers, imports, module_exports);

	throw new Error(`options.format is invalid (must be ${list(Object.keys(wrappers))})`);
}

function editSource(source, sveltePath) {
	return source === 'svelte' || source.startsWith('svelte/')
		? source.replace('svelte', sveltePath)
		: source;
}

function esm(
	code: string,
	name: string,
	options: CompileOptions,
	banner: string,
	sveltePath: string,
	internalPath: string,
	helpers: { name: string, alias: string }[],
	imports: Node[],
	module_exports: Export[],
	source: string
) {
	const importHelpers = helpers.length > 0 && (
		`import { ${helpers.map(h => h.name === h.alias ? h.name : `${h.name} as ${h.alias}`).join(', ')} } from ${JSON.stringify(internalPath)};`
	);

	const importBlock = imports.length > 0 && (
		imports
			.map((declaration: Node) => {
				const import_source = editSource(declaration.source.value, sveltePath);

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
		${importHelpers}
		${importBlock}

		${code}

		export default ${name};
		${module_exports.length > 0 && `export { ${module_exports.map(e => e.name === e.as ? e.name : `${e.name} as ${e.as}`).join(', ')} };`}`;
}

function cjs(
	code: string,
	name: string,
	banner: string,
	sveltePath: string,
	internalPath: string,
	helpers: { name: string, alias: string }[],
	imports: Node[],
	module_exports: Export[]
) {
	const helperDeclarations = helpers.map(h => `${h.alias === h.name ? h.name : `${h.name}: ${h.alias}`}`).join(', ');

	const helperBlock = helpers.length > 0 && (
		`const { ${helperDeclarations} } = require(${JSON.stringify(internalPath)});\n`
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

		const source = editSource(node.source.value, sveltePath);

		return `const ${lhs} = require("${source}");`
	});

	const exports = [`exports.default = ${name};`].concat(
		module_exports.map(x => `exports.${x.as} = ${x.name};`)
	);

	return deindent`
		${banner}
		"use strict";

		${helperBlock}
		${requires}

		${code}

		${exports}`
}