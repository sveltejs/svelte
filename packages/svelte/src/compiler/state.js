/** @import { CompileOptions, SvelteNode } from './types' */
/** @import { Warning } from '#compiler' */
import { getLocator } from 'locate-character';

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
 * The original source code
 * @type {string}
 */
export let source;

/**
 * True if compiling with `dev: true`
 * @type {boolean}
 */
export let dev;

export let locator = getLocator('', { offsetLine: 1 });

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
 * @type {Map<SvelteNode | NodeLike, Set<string>[]>}
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
export function reset_warning_filter(fn = () => true) {
	warning_filter = fn;
}

/**
 * @param {SvelteNode | NodeLike} node
 * @param {import('../constants.js').IGNORABLE_RUNTIME_WARNINGS[number]} code
 * @returns
 */
export function is_ignored(node, code) {
	return dev && !!ignore_map.get(node)?.some((codes) => codes.has(code));
}

/**
 * @param {string} _source
 * @param {{ dev?: boolean; filename: string; rootDir?: string }} options
 */
export function reset(_source, options) {
	source = _source;
	const root_dir = options.rootDir?.replace(/\\/g, '/');
	filename = options.filename.replace(/\\/g, '/');

	dev = !!options.dev;

	if (typeof root_dir === 'string' && filename.startsWith(root_dir)) {
		// make filename relative to rootDir
		filename = filename.replace(root_dir, '').replace(/^[/\\]/, '');
	}

	locator = getLocator(source, { offsetLine: 1 });
	warnings = [];
	ignore_stack = [];
	ignore_map.clear();
}
