import { b } from 'code-red';

/**
 * @param {any} program
 * @param {import('estree').Identifier} name
 * @param {string} banner
 * @param {any} sveltePath
 * @param {Array<{ name: string; alias: import('estree').Identifier }>} helpers
 * @param {Array<{ name: string; alias: import('estree').Identifier }>} globals
 * @param {import('estree').ImportDeclaration[]} imports
 * @param {Export[]} module_exports
 * @param {import('estree').ExportNamedDeclaration[]} exports_from
 */
export default function create_module(
	program,
	name,
	banner,
	sveltePath = 'svelte',
	helpers,
	globals,
	imports,
	module_exports,
	exports_from
) {
	const internal_path = `${sveltePath}/internal`;
	helpers.sort((a, b) => (a.name < b.name ? -1 : 1));
	globals.sort((a, b) => (a.name < b.name ? -1 : 1));
	return esm(
		program,
		name,
		banner,
		sveltePath,
		internal_path,
		helpers,
		globals,
		imports,
		module_exports,
		exports_from
	);
}

/**
 * @param {any} source
 * @param {any} sveltePath
 */
function edit_source(source, sveltePath) {
	return source === 'svelte' || source.startsWith('svelte/')
		? source.replace('svelte', sveltePath)
		: source;
}

/**
 * @param {Array<{ name: string; alias: import('estree').Identifier }>} globals
 * @param {Array<{ name: string; alias: import('estree').Identifier }>} helpers
 */
function get_internal_globals(globals, helpers) {
	return (
		globals.length > 0 && {
			type: 'VariableDeclaration',
			kind: 'const',
			declarations: [
				{
					type: 'VariableDeclarator',
					id: {
						type: 'ObjectPattern',
						properties: globals.map((g) => ({
							type: 'Property',
							method: false,
							shorthand: false,
							computed: false,
							key: { type: 'Identifier', name: g.name },
							value: g.alias,
							kind: 'init'
						}))
					},
					init: helpers.find(({ name }) => name === 'globals').alias
				}
			]
		}
	);
}

/**
 * @param {any} program
 * @param {import('estree').Identifier} name
 * @param {string} banner
 * @param {string} sveltePath
 * @param {string} internal_path
 * @param {Array<{ name: string; alias: import('estree').Identifier }>} helpers
 * @param {Array<{ name: string; alias: import('estree').Identifier }>} globals
 * @param {import('estree').ImportDeclaration[]} imports
 * @param {Export[]} module_exports
 * @param {import('estree').ExportNamedDeclaration[]} exports_from
 */
function esm(
	program,
	name,
	banner,
	sveltePath,
	internal_path,
	helpers,
	globals,
	imports,
	module_exports,
	exports_from
) {
	const import_declaration = {
		type: 'ImportDeclaration',
		specifiers: helpers.map((h) => ({
			type: 'ImportSpecifier',
			local: h.alias,
			imported: { type: 'Identifier', name: h.name }
		})),
		source: { type: 'Literal', value: internal_path }
	};
	const internal_globals = get_internal_globals(globals, helpers);
	// edit user imports

	/** @param {any} node */
	function rewrite_import(node) {
		const value = edit_source(node.source.value, sveltePath);
		if (node.source.value !== value) {
			node.source.value = value;
			node.source.raw = null;
		}
	}
	imports.forEach(rewrite_import);
	exports_from.forEach(rewrite_import);
	const exports = module_exports.length > 0 && {
		type: 'ExportNamedDeclaration',
		specifiers: module_exports.map((x) => ({
			type: 'Specifier',
			local: { type: 'Identifier', name: x.name },
			exported: { type: 'Identifier', name: x.as }
		}))
	};
	program.body = b`
		/* ${banner} */

		${import_declaration}
		${internal_globals}
		${imports}
		${exports_from}

		${program.body}

		export default ${name};
		${exports}
	`;
}

/**
 * @typedef {Object} Export
 * @property {string} name
 * @property {string} as
 */
