import { parse as _parse } from './phases/1-parse/index.js';
import { parse as parse_acorn } from './phases/1-parse/acorn.js';
import { analyze_component, analyze_module } from './phases/2-analyze/index.js';
import { transform_component, transform_module } from './phases/3-transform/index.js';
import { getLocator } from 'locate-character';
import { walk } from 'zimmerframe';
import { validate_component_options, validate_module_options } from './validate-options.js';
import { convert } from './legacy.js';
import { transform_warnings } from './utils/warnings.js';
export { default as preprocess } from './preprocess/index.js';

/**
 * @param {string} source
 * @param {string | undefined} filename
 * @param {Function} fn
 */
function handle_error(source, filename, fn) {
	try {
		return fn();
	} catch (e) {
		if (/** @type {any} */ (e).name === 'CompileError') {
			const error = /** @type {import('#compiler').CompileError} */ (e);

			error.filename = filename;

			if (error.position) {
				// TODO this is reused with warnings — DRY out
				const locator = getLocator(source, { offsetLine: 1 });
				const start = locator(error.position[0]);
				const end = locator(error.position[1]);

				error.start = start;
				error.end = end;
			}
		}

		throw e;
	}
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
 * @returns {import('#compiler').SvelteNode | import('./types/legacy-nodes.js').LegacySvelteNode}
 */
export function parse(source, options = {}) {
	return handle_error(source, undefined, () => {
		/** @type {import('#compiler').Root} */
		const ast = _parse(source);

		if (options.modern) {
			// remove things that we don't want to treat as public API
			return walk(/** @type {import('#compiler').SvelteNode} */ (ast), null, {
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
	});
}

/**
 * @param {string} source
 * @param {TODO} options
 */
export function analyze(source, options = {}) {
	return handle_error(source, options.filename, () => {
		const validated = validate_component_options(options, '');
		const parsed = _parse(source);

		const combined_options = /** @type {import('#compiler').ValidatedCompileOptions} */ ({
			...validated,
			...parsed.options
		});

		const analysis = analyze_component(parsed, combined_options);

		return {
			warnings: transform_warnings(source, options.filename, analysis.warnings)
		};
	});
}

/**
 * `compile` converts your `.svelte` source code into a JavaScript module that exports a component
 *
 * https://svelte.dev/docs/svelte-compiler#svelte-compile
 * @param {string} source The component source code
 * @param {import('#compiler').CompileOptions} options The compiler options
 * @returns {import('#compiler').CompileResult}
 */
export function compile(source, options) {
	return handle_error(source, options.filename, () => {
		const validated = validate_component_options(options, '');
		const parsed = _parse(source);

		const combined_options = /** @type {import('#compiler').ValidatedCompileOptions} */ ({
			...validated,
			...parsed.options
		});

		const analysis = analyze_component(parsed, combined_options);
		const result = transform_component(analysis, source, combined_options);
		return result;
	});
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
	return handle_error(source, options.filename, () => {
		const validated = validate_module_options(options, '');
		const analysis = analyze_module(parse_acorn(source), validated);
		return transform_module(analysis, source, validated);
	});
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
