/** @import { LegacyRoot } from './types/legacy-nodes.js' */
/** @import { CompileOptions, CompileResult, ValidatedCompileOptions, ModuleCompileOptions } from '#compiler' */
/** @import { AST } from './public.js' */
import { walk as zimmerframe_walk } from 'zimmerframe';
import { convert } from './legacy.js';
import { parse as parse_acorn } from './phases/1-parse/acorn.js';
import { parse as _parse } from './phases/1-parse/index.js';
import { remove_typescript_nodes } from './phases/1-parse/remove_typescript_nodes.js';
import { analyze_component, analyze_module } from './phases/2-analyze/index.js';
import { transform_component, transform_module } from './phases/3-transform/index.js';
import { validate_component_options, validate_module_options } from './validate-options.js';
import * as state from './state.js';
export { default as preprocess } from './preprocess/index.js';

/**
 * `compile` converts your `.svelte` source code into a JavaScript module that exports a component
 *
 * @param {string} source The component source code
 * @param {CompileOptions} options The compiler options
 * @returns {CompileResult}
 */
export function compile(source, options) {
	source = remove_bom(source);
	state.reset_warning_filter(options.warningFilter);
	const validated = validate_component_options(options, '');
	state.reset(source, validated);

	let parsed = _parse(source);

	const { customElement: customElementOptions, ...parsed_options } = parsed.options || {};

	/** @type {ValidatedCompileOptions} */
	const combined_options = {
		...validated,
		...parsed_options,
		customElementOptions
	};

	if (parsed.metadata.ts) {
		parsed = {
			...parsed,
			fragment: parsed.fragment && remove_typescript_nodes(parsed.fragment),
			instance: parsed.instance && remove_typescript_nodes(parsed.instance),
			module: parsed.module && remove_typescript_nodes(parsed.module)
		};
		if (combined_options.customElementOptions?.extend) {
			combined_options.customElementOptions.extend = remove_typescript_nodes(
				combined_options.customElementOptions?.extend
			);
		}
	}

	const analysis = analyze_component(parsed, source, combined_options);
	const result = transform_component(analysis, source, combined_options);
	result.ast = to_public_ast(source, parsed, options.modernAst);
	return result;
}

/**
 * `compileModule` takes your JavaScript source code containing runes, and turns it into a JavaScript module.
 *
 * @param {string} source The component source code
 * @param {ModuleCompileOptions} options
 * @returns {CompileResult}
 */
export function compileModule(source, options) {
	source = remove_bom(source);
	state.reset_warning_filter(options.warningFilter);
	const validated = validate_module_options(options, '');
	state.reset(source, validated);

	const analysis = analyze_module(parse_acorn(source, false), validated);
	return transform_module(analysis, source, validated);
}

/**
 * The parse function parses a component, returning only its abstract syntax tree.
 *
 * The `modern` option (`false` by default in Svelte 5) makes the parser return a modern AST instead of the legacy AST.
 * `modern` will become `true` by default in Svelte 6, and the option will be removed in Svelte 7.
 *
 * @overload
 * @param {string} source
 * @param {{ filename?: string; modern: true; loose?: boolean }} options
 * @returns {AST.Root}
 */

/**
 * The parse function parses a component, returning only its abstract syntax tree.
 *
 * The `modern` option (`false` by default in Svelte 5) makes the parser return a modern AST instead of the legacy AST.
 * `modern` will become `true` by default in Svelte 6, and the option will be removed in Svelte 7.
 *
 * @overload
 * @param {string} source
 * @param {{ filename?: string; modern?: false; loose?: boolean }} [options]
 * @returns {Record<string, any>}
 */

/**
 * The parse function parses a component, returning only its abstract syntax tree.
 *
 * The `modern` option (`false` by default in Svelte 5) makes the parser return a modern AST instead of the legacy AST.
 * `modern` will become `true` by default in Svelte 6, and the option will be removed in Svelte 7.
 *
 * The `loose` option, available since 5.13.0, tries to always return an AST even if the input will not successfully compile.
 *
 * @param {string} source
 * @param {{ filename?: string; rootDir?: string; modern?: boolean; loose?: boolean }} [options]
 * @returns {AST.Root | LegacyRoot}
 */
export function parse(source, { filename, rootDir, modern, loose } = {}) {
	source = remove_bom(source);
	state.reset_warning_filter(() => false);
	state.reset(source, { filename: filename ?? '(unknown)', rootDir });

	const ast = _parse(source, loose);
	return to_public_ast(source, ast, modern);
}

/**
 * @param {string} source
 * @param {AST.Root} ast
 * @param {boolean | undefined} modern
 */
function to_public_ast(source, ast, modern) {
	if (modern) {
		const clean = (/** @type {any} */ node) => {
			delete node.metadata;
		};

		ast.options?.attributes.forEach((attribute) => {
			clean(attribute);
			clean(attribute.value);
			if (Array.isArray(attribute.value)) {
				attribute.value.forEach(clean);
			}
		});

		// remove things that we don't want to treat as public API
		return zimmerframe_walk(ast, null, {
			_(node, { next }) {
				clean(node);
				next();
			}
		});
	}

	return convert(source, ast);
}

/**
 * Remove the byte order mark from a string if it's present since it would mess with our template generation logic
 * @param {string} source
 */
function remove_bom(source) {
	if (source.charCodeAt(0) === 0xfeff) {
		return source.slice(1);
	}
	return source;
}

/**
 * @deprecated Replace this with `import { walk } from 'estree-walker'`
 * @returns {never}
 */
export function walk() {
	throw new Error(
		`'svelte/compiler' no longer exports a \`walk\` utility — please import it directly from 'estree-walker' instead`
	);
}

export { VERSION } from '../version.js';
export { migrate } from './migrate/index.js';
