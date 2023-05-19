import list from '../utils/list.js';
import { b, x } from 'code-red';
const wrappers = { esm, cjs };

/**
 * @param {any} program
 * @param {import('../interfaces.js').ModuleFormat} format
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
	format,
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
	helpers.sort(
		/**
		 * @param {any} a
		 * @param {any} b
		 */ (a, b) => (a.name < b.name ? -1 : 1)
	);
	globals.sort(
		/**
		 * @param {any} a
		 * @param {any} b
		 */ (a, b) => (a.name < b.name ? -1 : 1)
	);
	const formatter = wrappers[format];
	if (!formatter) {
		throw new Error(`options.format is invalid (must be ${list(Object.keys(wrappers))})`);
	}
	return formatter(
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
						properties: globals.map(
							/** @param {any} g */ (g) => ({
								type: 'Property',
								method: false,
								shorthand: false,
								computed: false,
								key: { type: 'Identifier', name: g.name },
								value: g.alias,
								kind: 'init'
							})
						)
					},
					init: helpers.find(/** @param {any}params_0 */ ({ name }) => name === 'globals').alias
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
		specifiers: helpers.map(
			/** @param {any} h */ (h) => ({
				type: 'ImportSpecifier',
				local: h.alias,
				imported: { type: 'Identifier', name: h.name }
			})
		),
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
		specifiers: module_exports.map(
			/** @param {any} x */ (x) => ({
				type: 'Specifier',
				local: { type: 'Identifier', name: x.name },
				exported: { type: 'Identifier', name: x.as }
			})
		)
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
function cjs(
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
	const internal_requires = {
		type: 'VariableDeclaration',
		kind: 'const',
		declarations: [
			{
				type: 'VariableDeclarator',
				id: {
					type: 'ObjectPattern',
					properties: helpers.map(
						/** @param {any} h */ (h) => ({
							type: 'Property',
							method: false,
							shorthand: false,
							computed: false,
							key: { type: 'Identifier', name: h.name },
							value: h.alias,
							kind: 'init'
						})
					)
				},
				init: x`require("${internal_path}")`
			}
		]
	};
	const internal_globals = get_internal_globals(globals, helpers);
	const user_requires = imports.map(
		/** @param {any} node */ (node) => {
			const init = x`require("${edit_source(node.source.value, sveltePath)}")`;
			if (node.specifiers.length === 0) {
				return b`${init};`;
			}
			return {
				type: 'VariableDeclaration',
				kind: 'const',
				declarations: [
					{
						type: 'VariableDeclarator',
						id:
							node.specifiers[0].type === 'ImportNamespaceSpecifier'
								? { type: 'Identifier', name: node.specifiers[0].local.name }
								: {
										type: 'ObjectPattern',
										properties: node.specifiers.map(
											/** @param {any} s */ (s) => ({
												type: 'Property',
												method: false,
												shorthand: false,
												computed: false,
												key:
													s.type === 'ImportSpecifier'
														? s.imported
														: { type: 'Identifier', name: 'default' },
												value: s.local,
												kind: 'init'
											})
										)
								  },
						init
					}
				]
			};
		}
	);
	const exports = module_exports.map(
		/** @param {any} x */
		(x) =>
			b`exports.${{ type: 'Identifier', name: x.as }} = ${{ type: 'Identifier', name: x.name }};`
	);
	const user_exports_from = exports_from.map(
		/** @param {any} node */ (node) => {
			const init = x`require("${edit_source(node.source.value, sveltePath)}")`;
			return node.specifiers.map(
				/** @param {any} specifier */ (specifier) => {
					return b`exports.${specifier.exported} = ${init}.${specifier.local};`;
				}
			);
		}
	);
	program.body = b`
		/* ${banner} */

		"use strict";
		${internal_requires}
		${internal_globals}
		${user_requires}
		${user_exports_from}

		${program.body}

		exports.default = ${name};
		${exports}
	`;
}

/** @typedef {Object} Export
 * @property {string} name
 * @property {string} as
 */
