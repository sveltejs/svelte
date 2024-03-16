import { getLocator } from 'locate-character';
import { walk } from 'zimmerframe';
import { CompileError } from './errors.js';
import { convert } from './legacy.js';
import { parse as parse_acorn } from './phases/1-parse/acorn.js';
import { parse as _parse } from './phases/1-parse/index.js';
import { remove_typescript_nodes } from './phases/1-parse/remove_typescript_nodes.js';
import { analyze_component, analyze_module } from './phases/2-analyze/index.js';
import { transform_component, transform_module } from './phases/3-transform/index.js';
import { validate_component_options, validate_module_options } from './validate-options.js';
export { default as preprocess } from './preprocess/index.js';

/**
 * `compile` converts your `.svelte` source code into a JavaScript module that exports a component
 *
 * https://svelte.dev/docs/svelte-compiler#svelte-compile
 * @param {string} source The component source code
 * @param {import('#compiler').CompileOptions} options The compiler options
 * @returns {import('#compiler').CompileResult}
 */
export function compile(source, options) {
	try {
		const validated = validate_component_options(options, '');
		let parsed = _parse(source);

		const { customElement: customElementOptions, ...parsed_options } = parsed.options || {};

		/** @type {import('#compiler').ValidatedCompileOptions} */
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
		}

		const analysis = analyze_component(parsed, combined_options);

		const result = transform_component(analysis, source, combined_options);
		return result;
	} catch (e) {
		if (e instanceof CompileError) {
			handle_compile_error(e, options.filename, source);
		}

		throw e;
	}
}

/**
 * `compileModule` takes your JavaScript source code containing runes, and turns it into a JavaScript module.
 *
 * https://svelte.dev/docs/svelte-compiler#svelte-compile
 * @param {string} source The component source code
 * @param {import('#compiler').ModuleCompileOptions} options
 * @returns {import('#compiler').CompileResult}
 */
export function compileModule(source, options) {
	try {
		const validated = validate_module_options(options, '');
		const analysis = analyze_module(parse_acorn(source, false), validated);
		return transform_module(analysis, source, validated);
	} catch (e) {
		if (e instanceof CompileError) {
			handle_compile_error(e, options.filename, source);
		}

		throw e;
	}
}

/**
 * @param {import('#compiler').CompileError} error
 * @param {string | undefined} filename
 * @param {string} source
 */
function handle_compile_error(error, filename, source) {
	error.filename = filename;

	if (error.position) {
		// TODO this is reused with warnings — DRY out
		const locator = getLocator(source, { offsetLine: 1 });
		const start = locator(error.position[0]);
		const end = locator(error.position[1]);

		error.start = start;
		error.end = end;
	}

	throw error;
}

/**
 * The parse function parses a component, returning only its abstract syntax tree.
 *
 * The `modern` option (`false` by default in Svelte 5) makes the parser return a modern AST instead of the legacy AST.
 * `modern` will become `true` by default in Svelte 6, and the option will be removed in Svelte 7.
 *
 * https://svelte.dev/docs/svelte-compiler#svelte-parse
 * @param {string} source
 * @param {{ filename?: string; modern?: boolean }} [options]
 * @returns {import('#compiler').Root | import('./types/legacy-nodes.js').LegacyRoot}
 */
export function parse(source, options = {}) {
	/** @type {import('#compiler').Root} */
	let ast;
	try {
		ast = _parse(source);
	} catch (e) {
		if (e instanceof CompileError) {
			handle_compile_error(e, options.filename, source);
		}

		throw e;
	}

	if (options.modern) {
		// remove things that we don't want to treat as public API
		return walk(ast, null, {
			_(node, { next }) {
				// @ts-ignore
				delete node.parent;
				// @ts-ignore
				delete node.metadata;
				next();
			}
		});
	}

	return convert(source, ast);
}

/**
 * @deprecated Replace this with `import { walk } from 'estree-walker'`
 * @returns {never}
 */
function _walk() {
	throw new Error(
		`'svelte/compiler' no longer exports a \`walk\` utility — please import it directly from 'estree-walker' instead`
	);
}

export { _walk as walk };

export { CompileError } from './errors.js';

export { VERSION } from '../version.js';
