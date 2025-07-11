/** @import { Location } from 'locate-character' */
/** @import { CompileOptions } from './types' */
/** @import { AST, Warning } from '#compiler' */
import { getLocator } from 'locate-character';
import { sanitize_location } from '../utils.js';

/** @typedef {{ start?: number, end?: number }} NodeLike */

/** @type {Warning[]} */
export let warnings = [];

/**
 * The filename relative to the rootDir (if specified).
 * This should not be used in the compiler output except in dev mode
 * @type {string}
 */
export let filename;

/**
 * The name of the component that is used in the `export default function ...` statement.
 */
export let component_name = '<unknown>';

/**
 * The original source code
 * @type {string}
 */
export let source;

/**
 * True if compiling with `dev: true`
 * @type {boolean}
 */
export let dev;

export let runes = false;

export let locator = getLocator('', { offsetLine: 1 });

/** @param {string} value */
export function set_source(value) {
	source = value;
	locator = getLocator(source, { offsetLine: 1 });
}

/**
 * @param {AST.SvelteNode & { start?: number | undefined }} node
 */
export function locate_node(node) {
	const loc = /** @type {Location} */ (locator(/** @type {number} */ (node.start)));
	return `${sanitize_location(filename)}:${loc?.line}:${loc.column}`;
}

/** @type {NonNullable<CompileOptions['warningFilter']>} */
export let warning_filter;

/**
 * The current stack of ignored warnings
 * @type {Set<string>[]}
 */
export let ignore_stack = [];

/**
 * For each node the list of warnings that should be ignored for that node.
 * Exists in addition to `ignore_stack` because not all warnings are emitted
 * while the stack is being built.
 * @type {Map<AST.SvelteNode | NodeLike, Set<string>[]>}
 */
export let ignore_map = new Map();

/**
 * @param {string[]} ignores
 */
export function push_ignore(ignores) {
	const next = new Set([...(ignore_stack.at(-1) || []), ...ignores]);
	ignore_stack.push(next);
}

export function pop_ignore() {
	ignore_stack.pop();
}

/**
 *
 * @param {(warning: Warning) => boolean} fn
 */
export function reset_warnings(fn = () => true) {
	warning_filter = fn;
	warnings = [];
}

/**
 * @param {AST.SvelteNode | NodeLike} node
 * @param {import('../constants.js').IGNORABLE_RUNTIME_WARNINGS[number]} code
 * @returns
 */
export function is_ignored(node, code) {
	return dev && !!ignore_map.get(node)?.some((codes) => codes.has(code));
}

/**
 * @param {{
 *   dev: boolean;
 *   filename: string;
 *   component_name?: string;
 *   rootDir?: string;
 *   runes: boolean;
 * }} state
 */
export function reset(state) {
	const root_dir = state.rootDir?.replace(/\\/g, '/');
	filename = state.filename.replace(/\\/g, '/');

	dev = state.dev;
	runes = state.runes;
	component_name = state.component_name ?? '(unknown)';

	if (typeof root_dir === 'string' && filename.startsWith(root_dir)) {
		// make filename relative to rootDir
		filename = filename.replace(root_dir, '').replace(/^[/\\]/, '');
	}

	ignore_stack = [];
	ignore_map.clear();
}
